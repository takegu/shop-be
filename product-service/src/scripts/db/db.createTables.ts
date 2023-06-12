import PostgreClient from './db.connect.local';

async function createProductsTable() {
  try {
    await PostgreClient.schema.createTable('products', (table) => {
      table.string('product_id').primary();
      table.string('description');
      table.string('title');
      table.double('price');
    });
    console.log('Table products created successfully!');
  } catch (error) {
    console.error('Error products creating table:', error);
  } finally {
    PostgreClient.destroy();
  }
}

async function createStockTable() {
  try {
    await PostgreClient.schema.createTable('stock', (table) => {
      table.string('id').primary();
      table.integer('count');
    });
    console.log('Table stock created successfully!');
  } catch (error) {
    console.error('Error stock creating table:', error);
  } finally {
    PostgreClient.destroy();
  }
}

createProductsTable();
createStockTable();
