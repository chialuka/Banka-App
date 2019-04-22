import db from '.';

const userTableQuery = `
  CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_staff BOOLEAN NOT NULL,
    is_admin BOOLEAN NOT NULL
  )
`;

const accountTableQuery = `
  CREATE TABLE IF NOT EXISTS accounts(
    id SERIAL,
    owner_id INTEGER NOT NULL,
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

const tableNames = [
  {
    name: 'users',
    query: userTableQuery,
  },
  {
    name: 'accounts',
    query: accountTableQuery,
  },
  {
    name: 'transactions',
    query: transactionTableQuery,
  },
];

const createTable = async (name, query) => {
  try {
    await db.query(query);
    return `${name} table created successfully!`;
  } catch (error) {
    return `${name} table Failed to create!`;
  }
};

const createRelation = async () => {
  const usersAccountsQuery = `
  ALTER TABLE accounts DROP CONSTRAINT IF EXISTS owner_id;

  ALTER TABLE accounts
    ADD CONSTRAINT owner_id
    FOREIGN KEY(owner_id) REFERENCES users(id)
    ON DELETE CASCADE
  `;
  const accountsTransactionsQuery = `
  ALTER TABLE transactions DROP CONSTRAINT IF EXISTS account_id;

  ALTER TABLE transactions
    ADD CONSTRAINT account_number
    FOREIGN KEY(account_number) REFERENCES accounts(account_number)
    ON DELETE CASCADE
`;
  try {
    await db.query(usersAccountsQuery);
    await db.query(accountsTransactionsQuery);
    return 'Relations successfully created';
  } catch (error) {
    return 'Error creating relationships';
  }
};
const setupTables = async () => {
  await Promise.all(
    tableNames.map(({ name, query }) => createTable(name, query)),
  );
  await createRelation();
  await db.end();
};

setupTables();
