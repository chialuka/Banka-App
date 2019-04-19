import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({ connectionString: config });

const create = async (data) => {
  const {
    amount,
    description,
    accountNumber,
    status,
    cashierId,
    transactionType,
  } = data;
  const newItem = await pool.query(
    'INSERT INTO transactions(amount, description, account_number, status, cashier_id, transaction_type) RETURNING *',
    [amount, description, accountNumber, status, cashierId, transactionType],
  );
  return newItem.rows;
};

const findAll = async () => {
  const results = await pool.query('SELECT * FROM $1 ORDER BY id ASC');
  return results.rows;
};

const findOne = async (param) => {
  const result = await pool.query(
    'SELECT * FROM $1 WHERE id = $1',
    [param],
  );
  return result.rows;
};

export { create, findAll, findOne };
