import { buildResponce } from "../utils";
import { products } from "../mocks/data"

export const handler = async (event: any) => {
  try {
    return buildResponce(200, products);
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
