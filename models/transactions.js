import db from '../config';

/**
 * create a new row by inserting into the transactions table in the database
 * @name create
 * @async
 * @param {Object} data
 * @returns {Array}
 */
const create = async (data) => {
  const {
    amount, description, accountNumber, oldBalance,
    newBalance, transactionType, date, cashierId,
  } = data;
  const newItem = await db.query(
    `INSERT INTO transactions(
      amount, description, account_number, old_balance, new_balance, 
      transaction_type, created_on, cashier_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      amount, description, accountNumber, oldBalance,
      newBalance, transactionType, date, cashierId,
    ],
  );
  return newItem.rows[0];
};

/**
 * Find all transactions saved to the database
 * @async
 * @name findAll
 * @returns {Array}
 */
const findAll = async () => {
  const results = await db.query('SELECT * FROM transactions ORDER BY id ASC');
  return results.rows;
};

/**
 * Find the transaction with the given argument id and return it
 * @async
 * @name findOne
 * @param {Number} param
 * @returns {Array}
 */
const findOne = async (param) => {
  const result = await db.query('SELECT * FROM transactions WHERE id = $1', [
    param,
  ]);
  return result.rows[0];
};

export { create, findAll, findOne };
