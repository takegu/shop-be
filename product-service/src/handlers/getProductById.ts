import { buildResponce } from "../utils";
import { getProductById } from "../db/db.services";

export const handler = async (event: any) => {
  console.log('GetProductById: ', event);

  try {
    const { productId } = event.pathParameters;
    const result = await getProductById(productId);

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
