import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ImportServiceStack', {
  env: { region: process.env.IMPORT_SERVICE_AWS_REGION },
});

const bucket = s3.Bucket.fromBucketName(stack, 'ImportBucket', process.env.S3_BUCKET_NAME!);

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    IMPORT_SERVICE_AWS_REGION: process.env.IMPORT_SERVICE_AWS_REGION!,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME!,
  }
};

const importProductsFile = new NodejsFunction(stack, 'ImportProductsFileLambda', {
  ...sharedLambdaProps,
  functionName: 'importProductsFile',
  entry: 'src/handlers/importProductsFile.ts',
});

bucket.grantReadWrite(importProductsFile);

const api = new apiGateway.HttpApi(stack, 'ImportApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  }
});

api.addRoutes({
  integration: new HttpLambdaIntegration('ImportProductFileIntegration', importProductsFile),
  path: '/import',
  methods: [apiGateway.HttpMethod.GET],
});
