import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({ connectionString: config });

const create = async (data) => {
  const {
    accountNumber,
    createdOn,
    email,
    status,
    owner,
    accountType,
    accountBalance,
  } = data;
  const newItem = await pool.query(
    'INSERT INTO accounts (account_number, created_on, email, status, owner, account_type, account_balance) RETURNING *',
    [
      accountNumber,
      createdOn,
      email,
      status,
      owner,
      accountType,
      accountBalance,
    ],
  );
  return newItem.rows;
};

const findAll = async () => {
  const results = await pool.query('SELECT * FROM $1 ORDER BY id ASC');
  return results.rows;
};

const findOne = async (param) => {
  const result = await pool.query(
    'SELECT * FROM $1 WHERE id = $1 OR account_number = $1',
    [param],
  );
  return result.rows;
};

const findOneAndUpdate = async (data) => {
  const { status, id } = data;
  await pool.query(
    'UPDATE accounts SET status = $1 WHERE id = $2',
    [status, id],
  );
  const result = await findOne(id);
  return result;
};

const findOneAndDelete = async (id) => {
  await pool.query('DELETE FROM accounts WHERE id = $1', [id]);
  return id;
};

export {
  create, findAll, findOne, findOneAndUpdate, findOneAndDelete,
};
