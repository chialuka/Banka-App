import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  NODE_ENV, DB_URI_TEST, DB_URI_DEV, DB_URI_PROD,
} = process.env;

const supportedEnv = ['development', 'test', 'production'];

if (!supportedEnv.includes(NODE_ENV)) {
  throw new Error('Env not supported');
}

const config = {
  test: {
    url: DB_URI_TEST,
    ssl: false,
  },
  development: {
    url: DB_URI_DEV,
    ssl: false,
  },
  production: {
    url: DB_URI_PROD,
    ssl: true,
  },
};
const connectionString = config[NODE_ENV.toLowerCase()];

const db = new Pool({
  connectionString: connectionString.url,
  ssl: connectionString.ssl,
});
export default db;
