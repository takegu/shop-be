import PostgreClient from '../db/index';
import { products, stock } from '../../mocks/data';

async function insertData() {
  try {
    await PostgreClient('products').insert(products);
    console.log('Data products inserted successfully.');
  } catch (error) {
    console.error('Error products inserting data:', error);
  } finally {
    PostgreClient.destroy();
  }

  try {
    await PostgreClient('stock').insert(stock);
    console.log('Data stock inserted successfully.');
  } catch (error) {
    console.error('Error stock inserting data:', error);
  } finally {
    PostgreClient.destroy();
  }
}

insertData();
