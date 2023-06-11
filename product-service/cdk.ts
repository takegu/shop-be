import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import dotenv from 'dotenv';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ProductServiceStack', {
  env: { region: process.env.PRODUCT_AWS_REGION },
});

const productsTable = dynamodb.Table.fromTableName(stack, 'ProductsTable', 'products_table');
const stockTable = dynamodb.Table.fromTableName(stack, 'StockTable', 'stock_table');

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    PRODUCTS_TABLE_NAME: productsTable.tableName,
    STOCK_TABLE_NAME: stockTable.tableName,
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: process.env.DB_PORT!,
    DB_NAME: process.env.DB_NAME!,
    DB_USERNAME: process.env.DB_USERNAME!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
  },
  bundling: {
    externalModules: [
      'pg-native',
      'sqlite3',
      'pg-query-stream',
      'oracledb',
      'better-sqlite3',
      'tedious',
      'mysql',
      'mysql2',
    ],
  },
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

const createProduct = new NodejsFunction(stack, 'CreateProduct', {
  ...sharedLambdaProps,
  functionName: 'createProduct',
  entry: 'src/handlers/createProduct.ts',
});

const api = new apiGateway.HttpApi(stack, 'ProductApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  }
});

productsTable.grantReadData(getProductList);
productsTable.grantReadData(getProductById);
productsTable.grantReadWriteData(createProduct);

stockTable.grantReadData(getProductList);
stockTable.grantReadData(getProductById);
stockTable.grantReadWriteData(createProduct);

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

api.addRoutes({
  integration: new HttpLambdaIntegration('CreateProductListIntegration', createProduct),
  path: '/products',
  methods: [apiGateway.HttpMethod.POST],
});
