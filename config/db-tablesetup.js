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
    id SERIAL PRIMARY KEY,
    owner INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL,
    account_type TEXT NOT NULL,
    account_number BIGINT NOT NULL,
    account_balance NUMERIC(15,2) NOT NULL,
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
];

const createTable = async (name, query) => {
  try {
    await db.query(query);
    return (`${name} table created successfully!`);
  } catch (error) {
    return (`${name} table Failed to create!`);
  }
};

const setupTables = async () => {
  await Promise.all(
    tableNames.map(({ name, query }) => createTable(name, query)),
  );
  await db.end();
};

setupTables();
