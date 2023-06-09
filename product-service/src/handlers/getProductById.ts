import { buildResponce } from "../utils";
import { products, Product } from "../mocks/data"

export const handler = async (event: any) => {
  try {
    const { productId } = event.pathParameters;
    const product = products.find((element: Product) => element.id === productId);

    if (!product) {
      return buildResponce(404, {
        message: 'Product not found',
      })
    }

    return buildResponce(200, product);
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
