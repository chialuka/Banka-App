import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as Users from '../models/users';

dotenv.config();
const { SECRET } = process.env;

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const hashPassword = async password => bcrypt.hash(password, 8);

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const generateToken = (data) => {
  const token = jwt.sign(data, SECRET, { expiresIn: '1h' });
  return token;
};

const generateAccountNumber = () => {
  const accNum = `5${Math.floor(Math.random() * (10 ** 12))}`;
  return accNum.slice(0, 10);
};

const setServerResponse = (res, status, data) => {
  res.status(status).json({
    status,
    ...data,
  });
};

const checkExistingUser = async (res, id, param) => {
  const user = Users.findOneById(id);
  if (!user) {
    return setServerResponse(res, 404, { error: `${param} not found` });
  }
  return user;
};

export {
  capitalize,
  hashPassword,
  generateToken,
  comparePassword,
  setServerResponse,
  generateAccountNumber,
  checkExistingUser,
};
