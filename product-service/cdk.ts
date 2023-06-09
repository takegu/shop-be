import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ProductServiceStack', {
  env: { region: process.env.PRODUCT_AWS_REGION },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  }
};

const getProductList = new NodejsFunction(stack, 'GetProductListLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductList',
  entry: 'src/handlers/getProductList.ts',
});

const getProductById = new NodejsFunction(stack, 'GetProductBuIdLambda', {
  ...sharedLambdaProps,
  functionName: 'getProductById',
  entry: 'src/handlers/getProductById.ts',
});

const api = new apiGateway.HttpApi(stack, 'ProductApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  }
});

api.addRoutes({
  integration: new HttpLambdaIntegration('GetProductListIntegration', getProductList),
  path: '/products',
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration('GetProductListIntegration', getProductById),
  path: '/products/{productId}',
  methods: [apiGateway.HttpMethod.GET],
});
