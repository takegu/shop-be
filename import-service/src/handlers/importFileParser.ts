import { S3 } from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import { PassThrough, Readable } from "stream";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const {
  S3_BUCKET_NAME,
  SQS_QUEUE_URL,
  IMPORT_SERVICE_AWS_REGION,
} = process.env;

const s3Client = new S3({});
const sqsClient = new SQSClient({ region: IMPORT_SERVICE_AWS_REGION });

const getObjectReadStream = async (bucket: string | undefined, key: any) => {
  const passThroughStream = new PassThrough();
  const params = { Bucket: bucket, Key: key };

  const { Body } = await s3Client.getObject(params);

  if (Body instanceof Readable) {
    Body.pipe(passThroughStream);
  } else {
    passThroughStream.emit(
      'error',
      new Error(
        'Object body is not a Readable stream. Make sure to run this function in a Node.js environment.'
      )
    );
  }
  return passThroughStream;
}

const moveFileToParsedFolder = async (srcKey: string) => {
  const dstKey = srcKey.replace("uploaded/", "parsed/");
  const copyParams = {
    Bucket: S3_BUCKET_NAME,
    CopySource: `${S3_BUCKET_NAME}/${srcKey}`,
    Key: dstKey,
  };
  const deleteParams = {
    Bucket: S3_BUCKET_NAME,
    Key: srcKey,
  };

  await s3Client.copyObject(copyParams);
  await s3Client.deleteObject(deleteParams);
};

export const handler = async (event: any) => {
  for (const record of event.Records) {
    const { key } = record.s3.object;

    if (!key.startsWith('uploaded/')) {
      continue;
    }

    const readStream = await getObjectReadStream(S3_BUCKET_NAME, key);

    readStream
      .pipe(csvParser())
      .on('data', async (data) => {
        console.log('CSV record:', data);
        const command = new SendMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: JSON.stringify(data)
        });
        console.log('sqs params:', command)
        await sqsClient.send(command);
      })
      .on('end', async () => {
        console.log('CSV parsing completed for:', key);
      })
      .on('error', (error) => {
        console.error('Error during CSV parsing:', error);
      });

    try {
      await moveFileToParsedFolder(key);
      console.log('File moved to parsed folder:', key);
    } catch (error) {
      console.error('Error moving file to parsed folder:', error);
    }
  }
};