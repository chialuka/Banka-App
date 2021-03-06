import dotenv from 'dotenv';
import db from '../config';

dotenv.config();

const { USER_NAME } = process.env;

/**
 * Create a new user in the database using the insert query
 * @async
 * @name create
 * @param {Object} data
 * @returns {Array} new user created
 */
const create = async (data) => {
  const {
    firstname, lastname, email, password, isStaff, isAdmin
  } = data;
  const newItem = await db.query(
    `INSERT INTO users(
      first_name, last_name, email, password, is_staff, is_admin
      ) 
     VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [firstname, lastname, email, password, isStaff, isAdmin]
  );
  return newItem.rows[0];
};

/**
 * Find all users in the database
 * @async
 * @name findAll
 * @returns {Object} all users in the database
 */
const findAll = async () => {
  const results = await db.query('SELECT * FROM users ORDER BY id ASC');
  return results.rows;
};

/**
 * Find a single user on providing the user's id
 * @async
 * @name findOneById
 * @param {Number} id
 * @returns {Array} user with the given ID
 */
const findOneById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

/**
 * Find the user in the database with the provided email
 * @name findOneByEmail
 * @async
 * @param {String} email
 * @returns {Array} user with the given email address
 */
const findOneByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [
    email
  ]);
  return result.rows[0];
};

/**
 * Find all bank accounts that belong to the user with the provided ID
 * @async
 * @name findUserAccounts
 * @param {Number} id
 * @returns {Array} all accounts owned by the specified user
 */
const findUserAccounts = async (id) => {
  const result = await db.query('SELECT * FROM accounts WHERE owner = $1', [
    id
  ]);
  return result.rows;
};

/**
 * Find the user with the id in the arguments object and update the user's
 * details with other provided details
 * @async
 * @name findOneAndUpdate
 * @param {Object} data
 * @returns {Array} user whose details have been updated
 */
const findOneAndUpdate = async (data) => {
  const {
    firstname, lastname, password, email, id
  } = data;
  const result = await db.query(
    `UPDATE users 
     SET 
      first_name = COALESCE($1, first_name), 
      last_name = COALESCE($2, last_name), 
      password =  COALESCE($3, password),
      email = COALESCE($4, email)
    WHERE id = $5 RETURNING *`,
    [firstname, lastname, password, email, id]
  );
  return result.rows[0];
};

/**
 * Find the user with the given ID and delete the user's record from
 * the database. Delete any account owned by the user as well
 * @async
 * @name findOneAndDelete
 * @param {Number} id
 * @returns {Number} id of the account deleted
 */
const findOneAndDelete = async (id) => {
  await db.query('DELETE FROM accounts WHERE owner = $1', [id]);
  await db.query('DELETE FROM users WHERE id = $1 AND email <> $2', [
    id,
    `${USER_NAME}`
  ]);
  return id;
};

/**
 * Delete all users in the database
 * @async
 * @name deleteAll
 * @returns {Boolean} true when all accounts are deleted
 */
const deleteAll = async () => {
  await db.query('DELETE FROM accounts');
  await db.query('DELETE FROM users WHERE email <> $1', [`${USER_NAME}`]);
  return true;
};

/**
 * Save OTP in the DB table against user's details
 * @name saveOTP
 * @async
 * @param {Object} data
 * @returns {Object} details saved in the DB table
 */
const saveOTP = async (data) => {
  const {
    email, id, otp, time
  } = data;
  const result = await db.query(
    `INSERT INTO password (email, user_id, otp, time) 
    VALUES ($1, $2, $3, $4) RETURNING *`,
    [email, id, otp, time]
  );
  return result.rows[0];
};

/**
 * Find the user with the given OTP
 * @name findOTP
 * @async
 * @param {Number} otp
 * @returns {Array} DB entry with the provided OTP, if it exists
 */
const findOTP = async (otp) => {
  const result = await db.query('SELECT * FROM password WHERE otp = $1', [otp]);
  return result.rows[0];
};

/**
 * Delete OTP after it has been used
 * @name deleteOTP
 * @async
 * @param {Number} otp
 * @return {Boolean} true when OTP is deleted
 */
const deleteOTP = async (otp) => {
  await db.query('DELETE FROM password WHERE otp = $1', [otp]);
  return true;
};

export {
  create,
  findAll,
  findOneById,
  findOneByEmail,
  findUserAccounts,
  findOneAndUpdate,
  findOneAndDelete,
  deleteAll,
  saveOTP,
  findOTP,
  deleteOTP
};
