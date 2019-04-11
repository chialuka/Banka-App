import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const { SECRET } = process.env;

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const getNewId = len => (parseInt(len, 10) + 1);

const hashPassword = async password => bcrypt.hash(password, 8);

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const generateToken = (data) => {
  const token = jwt.sign(data, SECRET, { expiresIn: '1h' });
  return token;
};

const generateAccountNumber = () => {
  const accNum = `5${Math.floor(Math.random() * (10 ** 9))}`;
  return accNum;
};

const setServerResponse = (res, status, data) => {
  res.status(status).json({
    status,
    ...data,
  });
};

export {
  capitalize,
  hashPassword,
  generateToken,
  comparePassword,
  setServerResponse,
  generateAccountNumber,
};

export default getNewId;
