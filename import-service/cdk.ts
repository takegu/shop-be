import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ImportServiceStack', {
  env: { region: process.env.IMPORT_SERVICE_AWS_REGION },
});

const bucket = s3.Bucket.fromBucketName(stack, 'ImportBucket', process.env.S3_BUCKET_NAME!);

const queue = sqs.Queue.fromQueueArn(stack, 'catalogItemsQueue', `arn:aws:sqs:${process.env.IMPORT_SERVICE_AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:catalogItemsQueue`);

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

const importFileParser = new NodejsFunction(stack, 'ImportFileParserLambda', {
  ...sharedLambdaProps,
  functionName: 'importFileParser',
  entry: 'src/handlers/importFileParser.ts',
  environment: {
    ...sharedLambdaProps.environment,
    SQS_QUEUE_URL: queue.queueUrl,
  }
});

queue.grantSendMessages(importFileParser);

bucket.grantReadWrite(importFileParser);
bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new s3n.LambdaDestination(importFileParser),
  { prefix: 'uploaded/' }
);

const basicAuthorizerLambda = lambda.Function.fromFunctionArn(stack, 'BasicAuthorizerLambda', `arn:aws:lambda:${process.env.IMPORT_SERVICE_AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:function:basicAuthorizer`);

const authorizer = new HttpLambdaAuthorizer('basicAuthorizer', basicAuthorizerLambda, {
  responseTypes: [HttpLambdaResponseType.IAM],
});

const api = new apiGateway.HttpApi(stack, 'ImportApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  }
});

api.addRoutes({
  path: '/import',
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('ImportProductFileIntegration', importProductsFile),
  authorizer,
});
