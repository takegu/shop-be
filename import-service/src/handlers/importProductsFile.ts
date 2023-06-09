import { buildResponce } from "../utils";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const {
  IMPORT_SERVICE_AWS_REGION,
  S3_BUCKET_NAME,
} = process.env;

const s3Client = new S3Client({ region: IMPORT_SERVICE_AWS_REGION });

export const handler = async (event: any) => {
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return buildResponce(400, "The 'name' query parameter is required.");
  }

  const putObjectParams = {
    Bucket: S3_BUCKET_NAME,
    Key: `uploaded/${fileName}`,
    ContentType: "text/csv",
  };

  const putObjectCommand = new PutObjectCommand(putObjectParams);

  try {
    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 120,
    });

    return buildResponce(200, { url: signedUrl });
  } catch (error: any) {
    return buildResponce(500, 'Error while creating Signed URL: ' + error.message)
  }
};
