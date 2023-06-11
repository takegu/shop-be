import { buildResponce } from "../utils";
import { PutItemCommand, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { client } from "../dynamodb";

export const handler = async (event: any) => {
  try {

    if (event?.body) {
      const { title, description, price, count } = JSON.parse(event.body);

      if (!title || !description || isNaN(Number(price)) || isNaN(Number(count))) {
        return buildResponce(400, 'Invalid parameters');
      }

      const id = uuidv4();

      const productParams: PutItemCommandInput = {
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Item: {
          product_id: { S: id },
          title: { S: title },
          description: { S: description },
          price: { N: price },
        },
      };

      const stockParams: PutItemCommandInput = {
        TableName: process.env.STOCK_TABLE_NAME,
        Item: {
          product_id: { S: id },
          count: { N: count },
        },
      };

      const productCommand = new PutItemCommand(productParams);
      await client.send(productCommand);
      const stockCommand = new PutItemCommand(stockParams);
      await client.send(stockCommand);
      return buildResponce(200, {
        product_id: id,
        title,
        description,
        price,
        count
      });

    }
    return buildResponce(400, 'Missing required fields');
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
