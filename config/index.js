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
  },
  development: {
    url: DB_URI_DEV,
  },
  production: {
    url: DB_URI_PROD,
  },
};
const uri = config[NODE_ENV.toLowerCase()].url;

export default uri;
