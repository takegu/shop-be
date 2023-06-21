import { handler } from '../handlers/importProductsFile';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { mockEvent } from './test-mocks';

const mockedSignedUrl = 'https://example-bucket.s3.example.amazonaws.com/mocked-signed-url';
const s3ClientMock = mockClient(S3Client);

jest.mock('@aws-sdk/s3-request-presigner', () => {
  const originalModule = jest.requireActual('@aws-sdk/s3-request-presigner');
  return {
    ...originalModule,
    getSignedUrl: jest.fn(() => Promise.resolve(mockedSignedUrl)),
  };
});

describe('importProductsFile handler', () => {
  process.env.AWS_REGION = 'default';
  process.env.IMPORT_S3_BUCKET_NAME = 'example-bucket';

  afterEach(() => {
    jest.restoreAllMocks();
    s3ClientMock.restore();
  });

  it('should return a signed URL', async () => {
    s3ClientMock.on(PutObjectCommand, { Bucket: 'example-bucket' }).resolves({});

    const event: APIGatewayProxyEvent = {
      ...mockEvent,
      queryStringParameters: {
        name: 'products-import.csv',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body).url).toEqual(mockedSignedUrl);
  });

  it('should return a 400 error when the file name is not passed', async () => {
    const event: APIGatewayProxyEvent = {
      ...mockEvent,
      queryStringParameters: {
        name: ''
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toEqual("The 'name' query parameter is required.");
  });

  it('should return 500 error when an unexpected error occurs', async () => {
    const errorMsg = 'Test error';
    const event: APIGatewayProxyEvent = {
      ...mockEvent,
      queryStringParameters: {
        name: 'products-import.csv',
      },
    };

    const getSignedUrlMock = jest.spyOn(require('@aws-sdk/s3-request-presigner'), 'getSignedUrl');
    getSignedUrlMock.mockImplementation(() => {
      throw new Error(errorMsg);
    });

    const response = await handler(event);

    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.body)).toEqual("Error while creating Signed URL: " + errorMsg);
  })
});
