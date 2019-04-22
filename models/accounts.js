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
      account_number, created_on, status, 
      owner_id, account_type, account_balance
    ) 
    VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [accountNumber, createdOn, status, id, accountType, openingBalance],
  );
  return newItem.rows[0];
};

const findAll = async () => {
  const results = await db.query('SELECT * FROM accounts ORDER BY id ASC');
  return results.rows;
};

const findByStatus = async (status) => {
  const results = await db.query('SELECT * FROM accounts WHERE status = $1', [
    status,
  ]);
  return results.rows;
};

const findOne = async (param) => {
  const result = await db.query(
    'SELECT * FROM accounts WHERE account_number = $1 OR id = $1',
    [param],
  );
  return result.rows[0];
};

const findOneAndUpdate = async (...args) => {
  const [param] = args;
  const item = Object.entries(param);
  const result = await db.query(
    `UPDATE accounts SET ${item[0][0]} = $1 WHERE id = $2 RETURNING *`,
    [item[0][1], item[1][1]],
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
  create,
  findAll,
  findByStatus,
  findOne,
  findOneAndUpdate,
  findOneAndDelete,
  deleteAll,
};
