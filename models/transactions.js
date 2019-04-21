import db from '../config';

/**
 * create a new Transaction object in the database
 * @name create
 * @async
 * @param {Object} data
 * @returns {Array}
 */
const create = async (data) => {
  const {
    amount, description, accountNumber, oldBalance, newBalance,
    cashierId, transactionType, date,
  } = data;
  const newItem = await db.query(
    `INSERT INTO transactions(
      amount, description, account_number, old_balance, new_balance, 
      cashier_id, transaction_type, created_on
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      amount, description, accountNumber, oldBalance, newBalance,
      cashierId, transactionType, date,
    ],
  );
  return newItem.rows[0];
};

const findAll = async () => {
  const results = await db.query('SELECT * FROM $1 ORDER BY id ASC');
  return results.rows;
};

const findOne = async (param) => {
  const result = await db.query('SELECT * FROM $1 WHERE id = $1', [param]);
  return result.rows;
};

export { create, findAll, findOne };
