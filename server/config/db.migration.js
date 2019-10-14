import dotenv from 'dotenv';
import db from '.';

dotenv.config();

const { USER_NAME, PASSWORD } = process.env;

const userTableQuery = `
  CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_staff BOOLEAN,
    is_admin BOOLEAN
  )
`;

const accountTableQuery = `
  CREATE TABLE IF NOT EXISTS accounts(
    id SERIAL,
    owner INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL,
    account_type TEXT NOT NULL,
    account_number BIGINT NOT NULL UNIQUE,
    account_balance NUMERIC(15,2) NOT NULL,
    created_on TIMESTAMP NOT NULL,
    PRIMARY KEY(id, account_number)
  )
`;

const transactionTableQuery = `
  CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    account_number BIGINT NOT NULL,
    transaction_type VARCHAR(6) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    old_balance NUMERIC(15,2) NOT NULL,
    new_balance NUMERIC(15,2) NOT NULL,
    cashier_id INTEGER,
    created_on TIMESTAMP NOT NULL
  )
`;

const passwordTableQuery = `
  CREATE TABLE IF NOT EXISTS password(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    otp BIGINT NOT NULL,
    time DOUBLE PRECISION NOT NULL
  )
`;

const tableNames = [
  {
    name: 'users',
    query: userTableQuery
  },
  {
    name: 'accounts',
    query: accountTableQuery
  },
  {
    name: 'transactions',
    query: transactionTableQuery
  },
  {
    name: 'password',
    query: passwordTableQuery
  }
];

/**
 * Function for creating tables if they don't exist
 * @name createTable
 * @param {String} name
 * @param {Object} query
 * @returns {String} message detailing success or failure of table creation
 */
const createTable = async (name, query) => {
  try {
    await db.query(query);
    return `${name} table created successfully!`;
  } catch (error) {
    return `${name} table Failed to create!`;
  }
};

/**
 * Create relationships after tables have been created
 * @name createRelation
 * @returns {String} details of table relation creation
 */
const createRelation = async () => {
  const usersAccountsQuery = `
  ALTER TABLE accounts DROP CONSTRAINT IF EXISTS owner;
  ALTER TABLE accounts
    ADD CONSTRAINT owner
    FOREIGN KEY(owner) REFERENCES users(id)
    ON DELETE CASCADE
  `;

  const accountsTransactionsQuery = `
  ALTER TABLE transactions DROP CONSTRAINT IF EXISTS account_id;
  ALTER TABLE transactions
    ADD CONSTRAINT account_number
    FOREIGN KEY(account_number) REFERENCES accounts(account_number)
    ON DELETE CASCADE
`;

  const passwordUsersQuery = `
  ALTER TABLE password DROP CONSTRAINT IF EXISTS user_id;
  ALTER TABLE password
    ADD CONSTRAINT user_id
    FOREIGN KEY(user_id) REFERENCES users(id)
    ON DELETE CASCADE
  `;

  try {
    await db.query(usersAccountsQuery);
    await db.query(accountsTransactionsQuery);
    await db.query(passwordUsersQuery);
    return 'Relations successfully created';
  } catch (error) {
    return 'Error creating relationships';
  }
};

/**
 * Insert super admin after tables are created
 * @name insertSuperAdmin
 * @returns {String} details of insert
 */
const insertSuperAdmin = async () => {
  const adminInsert = `
  INSERT INTO users(
    first_name, last_name, email, password, is_staff, is_admin
  )
  VALUES (
    'Mazi', 'Odogwu', '${USER_NAME}', '${PASSWORD}', 'true', 'true'
    )
  ON CONFLICT (email)
  DO NOTHING;
`;
  try {
    await db.query(adminInsert);
    return ('insert succeeded');
  } catch (error) {
    return (error);
  }
};

/**
 * Call functions that create tables and relationships
 * @name setupTables
 * @returns {Null} Null
 */
const setupTables = async () => {
  await Promise.all(
    tableNames.map(({ name, query }) => createTable(name, query))
  );
  await createRelation();
  await insertSuperAdmin();
  await db.end();
};

setupTables();
