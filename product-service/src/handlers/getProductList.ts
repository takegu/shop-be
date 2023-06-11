import { buildResponce, removeAttributeValueFromItems } from "../utils";
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { client } from "../dynamodb";

export const handler = async (event: any) => {
  const productsParams = {
    TableName: process.env.PRODUCTS_TABLE_NAME,
  };

  const sctockParams = {
    TableName: process.env.STOCK_TABLE_NAME,
  };

  try {
    const productCommand = new ScanCommand(productsParams)
    const productResult = await client.send(productCommand);
    console.log('Products table responce', productResult);

    const stockCommand = new ScanCommand(sctockParams);
    const stockResult = await client.send(stockCommand);
    console.log('Stock table responce', stockResult);

    const productItems = removeAttributeValueFromItems(productResult);
    const stockItems = removeAttributeValueFromItems(stockResult);

    const result = productItems?.map(productItem => (
      { ...productItem, ...stockItems?.find(stockItem => stockItem.product_id === productItem.product_id) })
    );

    console.log('Joined tables', result);

    return buildResponce(200, result);
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
