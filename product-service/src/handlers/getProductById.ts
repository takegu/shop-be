import { buildResponce, removeAttributeValueFromItem } from "../utils";
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { client } from "../dynamodb";

export const handler = async (event: any) => {
  console.log('GetProductById: ', event);

  try {
    const { productId } = event.pathParameters;

    const productsParams = {
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Key: {
        product_id: { 'S': productId },
      }
    };

    const stockParams = {
      TableName: process.env.STOCK_TABLE_NAME,
      Key: {
        product_id: { 'S': productId },
      }
    };

    const productCommand = new GetItemCommand(productsParams);
    const productResult = await client.send(productCommand);

    const stockCommand = new GetItemCommand(stockParams);
    const stockResult = await client.send(stockCommand);

    const productItem = removeAttributeValueFromItem(productResult?.Item);
    const stockItem = removeAttributeValueFromItem(stockResult?.Item);
    const result = { ...productItem, ...stockItem };

    if (!result) {
      return buildResponce(404, {
        message: 'Product not found',
      })
    }

    return buildResponce(200, result);
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
