import { buildResponce, removeAttributeValueFromItem } from "../utils";
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { client } from "../dynamodb";

export const handler = async (event: any) => {
  try {
    const { productId } = event.pathParameters;

    const productsParams = {
      TableName: 'products_table',
      Key: {
        product_id: { 'S': productId },
      }
    };

    const stockParams = {
      TableName: 'stock_table',
      Key: {
        product_id: { 'S': productId },
      }
    };

    const productCommand = new GetItemCommand(productsParams);
    const productResult = await client.send(productCommand);
    console.log('Get product by id from products table: ', productResult);

    const stockCommand = new GetItemCommand(stockParams);
    const stockResult = await client.send(stockCommand);
    console.log('Get product by id from products table: ', stockResult);

    const productItem = removeAttributeValueFromItem(productResult?.Item);
    const stockItem = removeAttributeValueFromItem(stockResult?.Item);
    const result = { ...productItem, ...stockItem };

    console.log('Joined product object: ', result);

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
