import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, 'ProductServiceStack', {
  env: { region: process.env.PRODUCT_AWS_REGION },
});

const createProductTopic = new sns.Topic(stack, 'createProductTopic', {
  displayName: 'Create Product Topic'
});

const mainFilterPolicy = {
  count: sns.SubscriptionFilter.numericFilter({
    lessThanOrEqualTo: 10,
  }),
};

createProductTopic.addSubscription(
  new subs.EmailSubscription(process.env.EMAIL!, {
    filterPolicy: mainFilterPolicy
  })
);

const secondFilterPolicy = {
  count: sns.SubscriptionFilter.numericFilter({
    greaterThan: 10,
  }),
};

createProductTopic.addSubscription(
  new subs.EmailSubscription(process.env.ADDITIONAL_EMAIL_ADDRESS!, {
    filterPolicy: secondFilterPolicy
  })
);

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
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

const dlq = new sqs.Queue(stack, 'CatalogItemsDeadLetterQueue', {
  queueName: 'CatalogItemsDeadLetterQueue',
});

const queue = new sqs.Queue(stack, 'CatalogItemsQueue', {
  queueName: 'CatalogItemsQueue',
  visibilityTimeout: cdk.Duration.seconds(30),
  deadLetterQueue: {
    queue: dlq,
    maxReceiveCount: 1, // Set the maximum receive count to 1
  },
});

const catalogBatchProcess = new NodejsFunction(stack, 'CatalogBatchProcess', {
  ...sharedLambdaProps,
  functionName: 'catalogBatchProcess',
  entry: 'src/handlers/catalogBatchProcess.ts',
  timeout: cdk.Duration.seconds(30),
  environment: {
    ...sharedLambdaProps.environment,
    CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn,
    SQS_QUEUE_URL: queue.queueUrl,
  }
});

catalogBatchProcess.addEventSource(new SqsEventSource(queue, {
  batchSize: 5,
}));

queue.grantConsumeMessages(catalogBatchProcess);

createProduct.grantInvoke(catalogBatchProcess);
createProductTopic.grantPublish(catalogBatchProcess);

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

api.addRoutes({
  integration: new HttpLambdaIntegration('CreateProductListIntegration', createProduct),
  path: '/products',
  methods: [apiGateway.HttpMethod.POST],
});
