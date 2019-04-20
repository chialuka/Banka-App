import db from '../config';

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
      account_number, created_on, status, owner, account_type, account_balance
    ) 
    VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [accountNumber, createdOn, status, id, accountType, openingBalance],
  );
  return newItem.rows[0];
};

const findAll = async () => {
  const results = await db.query('SELECT * FROM $1 ORDER BY id ASC');
  return results.rows[0];
};

const findOne = async (param) => {
  const result = await db.query(
    'SELECT * FROM $1 WHERE id = $1 OR account_number = $1',
    [param],
  );
  return result.rows[0];
};

const findOneAndUpdate = async (data) => {
  const { status, id } = data;
  const result = await db.query(
    'UPDATE accounts SET status = $1 WHERE id = $2 RETURNING *',
    [status, id],
  );
  return result.rows[0];
};

const findOneAndDelete = async (id) => {
  await db.query('DELETE FROM accounts WHERE id = $1', [id]);
  return id;
};

const deleteAll = async () => {
  await db.query('DELETE FROM accounts');
  return true;
};

export {
  create, findAll, findOne, findOneAndUpdate, findOneAndDelete, deleteAll,
};
