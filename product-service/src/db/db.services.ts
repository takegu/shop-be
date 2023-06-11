import { ProductWithCount } from '../models/Product';
import PostgreClient from './db.connect';
import { v4 as uuidv4 } from 'uuid';

export const getProductsList = async () => {
  try {
    const products = await PostgreClient('products')
      .join('stock', 'products.product_id', 'stock.id')
      .select('products.*', 'stock.count');

    return products;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  }
};

export const getProductById = async (id: string) => {
  try {
    const product = await PostgreClient('products')
      .join('stock', 'products.product_id', 'stock.id')
      .select('products.*', 'stock.count')
      .where('products.product_id', id);

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
    await PostgreClient('stock').insert(
      {
        id: product_id,
        count,
      }
    );

    await PostgreClient('products').insert(
      {
        product_id,
        description,
        price,
        title
      }
    );

    return { product_id, ...product };
  } catch (error) {
    console.error('Error write data:', error);
    throw error;
  }
}
