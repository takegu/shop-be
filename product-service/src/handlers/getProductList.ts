import { buildResponce } from "../utils";
import { getProductsList } from "../db/db.services";

export const handler = async (event: any) => {
  console.log('GetProductsList');

  try {
    const result = await getProductsList();

    return buildResponce(200, result);
  } catch (err: any) {
    return buildResponce(500, {
      message: err.message,
    })
  }
};
