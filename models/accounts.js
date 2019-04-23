import db from '../config';

/**
 * Create a new account by inserting into the accounts table
 * @async
 * @name create
 * @param {Object} data
 * @returns {Array}
 */
const create = async (data) => {
  const {
    accountNumber,
    createdOn,
    status,
    id,
    accountType,
    openingBalance,
  } = data;
  const newItem = await db.query(
    `INSERT INTO accounts (
      account_number, created_on, status, 
      owner_id, account_type, account_balance
    ) 
    VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [accountNumber, createdOn, status, id, accountType, openingBalance],
  );
  return newItem.rows[0];
};

/**
 * Find all accounts in the database
 * @async
 * @name findAll
 * @returns {Array}
 */
const findAll = async () => {
  const results = await db.query('SELECT * FROM accounts ORDER BY id ASC');
  return results.rows;
};

/**
 * Find accounts by status. Accounts could be dormant or active
 * @async
 * @name findByStatus
 * @param {String} status
 * @returns {Array}
 */
const findByStatus = async (status) => {
  const results = await db.query('SELECT * FROM accounts WHERE status = $1', [
    status,
  ]);
  return results.rows;
};

/**
 * Find transactions linked to the account number given. Join the tables
 * and return the resulting array
 * @async
 * @authorname findByTransaction
 * @param {Number} params
 * @returns {Array}
 */
const findByTransaction = async (params) => {
  const results = await db.query(
    `SELECT transactions.id, transactions.created_on, 
    transactions.transaction_type, accounts.account_number, 
    transactions.old_balance, transactions.new_balance, transactions.amount 
    FROM transactions INNER JOIN accounts 
      ON transactions.account_number = accounts.account_number 
      WHERE transactions.account_number = $1`,
    [params],
  );
  return results.rows;
};

/**
 * Find ac account using the argument provided. The argument could either be
 * an email or an id
 * @async
 * @name findOne
 * @param {Number} param
 * @returns {Array}
 */
const findOne = async (param) => {
  const result = await db.query(
    'SELECT * FROM accounts WHERE account_number = $1 OR id = $1',
    [param],
  );
  return result.rows[0];
};

/**
 * Find the function whose id is given and then update it with the given status
 * which could be either active or dormant
 * @async
 * @name findOneAndDelete
 * @returns {Array}
 */
const findOneAndUpdate = async (...args) => {
  const [param] = args;
  const item = Object.entries(param);
  const result = await db.query(
    `UPDATE accounts SET ${item[0][0]} = $1 WHERE id = $2 RETURNING *`,
    [item[0][1], item[1][1]],
  );
  return result.rows[0];
};

/**
 * Find the account with the given id and delete it
 * @async
 * @name findOneAndDelete
 * @returns {Number}
 */
const findOneAndDelete = async (id) => {
  await db.query('DELETE FROM accounts WHERE id = $1', [id]);
  return id;
};

/**
 * Delete all accounts in the database
 * @async
 * @name deleteAll
 * @returns {Boolean}
 */
const deleteAll = async () => {
  await db.query('DELETE FROM accounts');
  return true;
};

export {
  create,
  findAll,
  findByStatus,
  findByTransaction,
  findOne,
  findOneAndUpdate,
  findOneAndDelete,
  deleteAll,
};
