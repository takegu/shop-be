import { S3 } from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import { PassThrough, Readable } from "stream";

const {
  S3_BUCKET_NAME,
} = process.env;

const s3Client = new S3({});

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

export const handler = async (event: any) => {
  for (const record of event.Records) {
    const { key } = record.s3.object;

    if (!key.startsWith('uploaded/')) {
      continue;
    }

    const readStream = await getObjectReadStream(S3_BUCKET_NAME, key);

    readStream
      .pipe(csvParser())
      .on('data', (data) => {
        console.log('CSV record:', data);
      })
      .on('end', () => {
        console.log('CSV parsing completed for:', key);
      })
      .on('error', (error) => {
        console.error('Error during CSV parsing:', error);
      });
  }
};
