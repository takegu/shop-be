import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, 'AuthorizationServiceStack', {
  env: { region: process.env.AUTHORIZATION_AWS_REGION },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    takegu: process.env.takegu!,
  },
};

const basicAuthorizer = new NodejsFunction(stack, 'BasicAuthorizerLambda', {
  ...sharedLambdaProps,
  functionName: 'basicAuthorizer',
  entry: 'src/handlers/basicAuthorizer.ts',
});
