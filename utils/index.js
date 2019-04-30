import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const { SECRET } = process.env;

/**
 * Capitalize string
 * @name capitalize
 * @param {String} str
 * @returns {String} string passed in with first letter capitalized
 */
const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

/**
 * hash password
 * @name hashPassword
 * @param {String} password
 * @returns {String} hashed password
 */
const hashPassword = async password => bcrypt.hash(password, 8);

/**
 * Compare password entered with password saved in the Database
 * @name comparePassword
 * @param {String} pword
 * @param {String} hash
 * @returns {Boolean} boolean indicating whether passwords match
 */
const comparePassword = async (pword, hash) => bcrypt.compare(pword, hash);

/**
 * Generate token with user's given ID
 * @name generateToken
 * @param {Object} data
 * @returns {String} the token generated for the user
 */
const generateToken = (data) => {
  const token = jwt.sign(data, SECRET, { expiresIn: '1h' });
  return token;
};

/**
 * Generate account number
 * @name generateAccountNumber
 * @returns {Number} account number generated
 */
const generateAccountNumber = () => {
  const accNum = `5${Math.floor(Math.random() * (10 ** 12))}`;
  return accNum.slice(0, 10);
};

/**
 * Function for setting response given parameters passed from controllers
 * @name setServerResponse
 * @param {Object} res
 * @param {Number} status
 * @param {Object} data
 * @returns {JSON} server response for the controller to pass to client
 */
const setServerResponse = (res, status, data) => {
  res.status(status).json({
    status,
    ...data
  });
};

/**
 * Format user object before returning it by removing null values
 * @name formatReturnedUser
 * @param {Object} user
 * @returns {Object} user object with null values removed
 */
const formatReturnedUser = (user) => {
  if (!user.is_staff) {
    delete user.is_staff;
    delete user.is_admin;
  }
  delete user.password;
  return user;
};

export {
  capitalize,
  hashPassword,
  generateToken,
  comparePassword,
  setServerResponse,
  generateAccountNumber,
  formatReturnedUser,
};
