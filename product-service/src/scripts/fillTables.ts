import PostgreClient from './db.connect.local';
import { products, stock } from '../mocks/data';

async function insertDataToProducts() {
  try {
    await PostgreClient('products').insert(products);
    console.log('Data products inserted successfully.');
  } catch (error) {
    console.error('Error products inserting data:', error);
  } finally {
    PostgreClient.destroy();
  }
}

async function insertDataToStock() {
  try {
    await PostgreClient('stock').insert(stock);
    console.log('Data stock inserted successfully.');
  } catch (error) {
    console.error('Error stock inserting data:', error);
  } finally {
    PostgreClient.destroy();
  }
}

export const getProductsList = async () => {
  try {
    const products = await PostgreClient('products')
      .join('stock', 'products.product_id', 'stock.id')
      .select('products.*', 'stock.count');

    return products;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  } finally {
    await PostgreClient.destroy();
  }
};

getProductsList();
