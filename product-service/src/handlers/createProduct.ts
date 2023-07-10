import { buildResponce } from "../utils";
import { createProduct } from "../db/db.services";

export const handler = async (event: any) => {
  console.log('CreateProduct: ', event);

  try {
    if (event?.body) {
      const { title, description, price, count } = JSON.parse(event.body);

      console.log('JSON.parse(event.body)', JSON.parse(event.body));
      

      if (!title || !description || isNaN(Number(price)) || isNaN(Number(count))) {
        return buildResponce(400, 'Invalid parameters');
      }

      const response = await createProduct({ title, description, price, count });

      return buildResponce(200, response);
    }

    return buildResponce(400, 'Missing required fields');
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
