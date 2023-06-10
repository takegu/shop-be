import { buildResponce, removeAttributeValueFromItems } from "../utils";
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { client } from "../dynamodb";

export const handler = async (event: any) => {
  const productsParams = {
    TableName: 'products_table',
  };

  try {
    const command = new ScanCommand(productsParams)
    const result = await client.send(command);

    const items = removeAttributeValueFromItems(result);

    return buildResponce(200, items);
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
