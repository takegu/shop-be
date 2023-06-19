import knex from 'knex';

const {
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
} = process.env;

const dbOptions = {
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USERNAME,
  password: DB_PASSWORD,
};

export default knex({
  client: 'pg',
  connection: dbOptions,
});
