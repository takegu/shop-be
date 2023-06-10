import { DynamoDBClient, GetItemCommandInput, GetItemCommand, ItemResponse } from '@aws-sdk/client-dynamodb';

export const client = new DynamoDBClient({
  region: process.env.PRODUCT_AWS_REGION,
});

