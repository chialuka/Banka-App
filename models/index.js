import { Pool } from 'pg';
import config from '../config';

const pool = new Pool(config);

const create = async (data) => {
  const newItem = await pool.query('INSERT INTO RETURNING *', [data]);
  return newItem;
};

const findAll = async (tableName) => {
  const results = await pool.query('SELECT * FROM $1 ORDER BY id ASC', [tableName]);
  return results;
};

const findOne = async (param) => {
  const result = await pool.query('SELECT * FROM $1 WHERE id = $1', [param]);
  return result;
};

const findOneAndUpdate = async (data) => {
  const result = await pool.query('UPDATE users ', [data]);
  return result;
};

const findOneAndDelete = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return id;
};

export {
  create, findAll, findOne, findOneAndUpdate, findOneAndDelete,
};
