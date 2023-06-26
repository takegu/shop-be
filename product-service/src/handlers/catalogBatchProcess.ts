import { handler as createProduct } from "./createProduct";
import { buildResponce } from "../utils";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const sns = new SNSClient({});

export const handler = async (event: any) => {
  console.log('catalogBatchProcess', JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      const newProductResponse = await createProduct(record);

      console.log('newProductData', newProductResponse);
      const parsedMessage = JSON.parse(newProductResponse.body).message;

      const snsParams = {
        Subject: 'Product Created',
        Message: `A new product has been created: ${JSON.stringify(parsedMessage)}`,
        TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
        MessageAttributes: {
          count: {
            DataType: 'Number',
            StringValue: parsedMessage.count,
          },
        },
      };
      if (newProductResponse.statusCode === 200) {
        await sns.send(new PublishCommand(snsParams));
        console.log('SNS event sent:', snsParams);
      } else {
        console.log('SNS event not sent:', snsParams);
      }
    }

    return buildResponce(200, event.Records);
  } catch (err: any) {
    console.error('Error by processing file:', err);

    return buildResponce(500, `Error creating product: ${err.message}`);
  }
}