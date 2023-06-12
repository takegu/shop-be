import { ProductWithCount } from '../models/Product';
import PostgreClient from './db.connect';
import { v4 as uuidv4 } from 'uuid';

export const getProductsList = async () => {
  try {
    const products = await PostgreClient.transaction(async (trx) => {
      const productList = await trx('products')
        .join('stock', 'products.product_id', 'stock.id')
        .select('products.*', 'stock.count');

      return productList;
    });

    return products;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  }
};

export const getProductById = async (id: string) => {
  try {
    const product = await PostgreClient.transaction(async (trx) => {
      const result = await trx('products')
        .join('stock', 'products.product_id', 'stock.id')
        .select('products.*', 'stock.count')
        .where('products.product_id', id);

      return result[0]; // Assuming there's only one product with the given ID
    });

    return product;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  }
};

export const createProduct = async (product: ProductWithCount) => {
  const product_id = uuidv4();

  const { description, price, title, count } = product;

  try {
    await PostgreClient.transaction(async (trx) => {
      await trx('stock').insert({
        id: product_id,
        count,
      });

      await trx('products').insert({
        product_id,
        description,
        price,
        title,
      });
    });

    return { product_id, ...product };
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
};
