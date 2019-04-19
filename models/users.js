import db from '../config';

const create = async (data) => {
  const {
    firstname, lastname, email, password, isStaff, isAdmin,
  } = data;
  const newItem = await db.query(
    'INSERT INTO users(first_name, last_name, email, password, is_staff, is_admin) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
    [firstname, lastname, email, password, isStaff, isAdmin],
  );
  return newItem.rows[0];
};

const findAll = async () => {
  const results = await db.query('SELECT * FROM users ORDER BY id ASC');
  return results.rows;
};

const findOneById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const findOneByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);
  return result.rows[0];
};

const findOneAndUpdate = async (data) => {
  const {
    firstname, lastname, password, id,
  } = data;
  const userId = Number(id);
  await db.query(
    'UPDATE users SET first_name = $1 WHERE $1 <> NULL, last_name = $2 WHERE $2 <> NULL, password = $3 WHERE $3 <> NULL, WHERE id = $4',
    [firstname, lastname, password, userId],
  );
  const result = await findOneById(userId);
  return result;
};

const findOneAndDelete = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
  return id;
};

const deleteAll = async () => {
  await db.query('DELETE FROM users');
  return true;
};

export {
  create,
  findAll,
  findOneById,
  findOneByEmail,
  findOneAndUpdate,
  findOneAndDelete,
  deleteAll,
};
