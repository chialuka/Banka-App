import { Pool } from 'pg';
import uri from '../config';

const pool = new Pool({
  connectionString: uri,
});

const create = async (data) => {
  const {
    firstname, lastname, email, password, isStaff, isAdmin,
  } = data;
  const newItem = await pool.query(
    'INSERT INTO users(firstname, lastname, email, password, is_staff, is_admin) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
    [firstname, lastname, email, password, isStaff, isAdmin],
  );
  return newItem.rows;
};

const findAll = async () => {
  const results = await pool.query('SELECT * FROM users ORDER BY id ASC');
  return results.rows;
};

const findOneById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows;
};

const findOneByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return result.rows;
};

const findOneAndUpdate = async (data) => {
  const {
    firstname, lastname, password, id,
  } = data;
  const userId = Number(id);
  await pool.query(
    'UPDATE users SET firstname = $1 WHERE $1 <> NULL, lastname = $2 WHERE $2 <> NULL, password = $3 WHERE $3 <> NULL, WHERE id = $4',
    [firstname, lastname, password, userId],
  );
  const result = await findOneById(userId);
  return result;
};

const findOneAndDelete = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return id;
};

export {
  create,
  findAll,
  findOneById,
  findOneByEmail,
  findOneAndUpdate,
  findOneAndDelete,
};
