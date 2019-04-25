import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  NODE_ENV, DB_URI_TEST, DB_URI_DEV, DATABASE_URL,
} = process.env;

const supportedEnv = ['development', 'test', 'production'];

const checkEnv = () => {
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
      url: DATABASE_URL,
      ssl: true,
    },
  };

  return config[NODE_ENV.toLowerCase()];
};

const connectionString = checkEnv();
const db = new Pool({
  connectionString: connectionString.url,
  ssl: connectionString.ssl,
});

export { checkEnv };
export default db;
