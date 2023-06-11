import { buildResponce, removeAttributeValueFromItems } from "../utils";
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { client } from "../dynamodb";

export const handler = async (event: any) => {
  console.log('GetProductsList');

  try {
    const productsParams = {
      TableName: process.env.PRODUCTS_TABLE_NAME,
    };

    const sctockParams = {
      TableName: process.env.STOCK_TABLE_NAME,
    };

    const productCommand = new ScanCommand(productsParams)
    const productResult = await client.send(productCommand);

    const stockCommand = new ScanCommand(sctockParams);
    const stockResult = await client.send(stockCommand);

    const productItems = removeAttributeValueFromItems(productResult);
    const stockItems = removeAttributeValueFromItems(stockResult);

    const result = productItems?.map(productItem => (
      { ...productItem, ...stockItems?.find(stockItem => stockItem.product_id === productItem.product_id) })
    );

    return buildResponce(200, result);
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
