import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';

const { secret } = config;

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const getNewId = len => len += 1;

const hashPassword = async password => bcrypt.hash(password, 10);

const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

const generateToken = (data) => {
  const token = jwt.sign({ payload: data }, secret, { expiresIn: '1h' });
  return token;
};

export {
  capitalize, hashPassword, generateToken, comparePassword,
};

export default getNewId;
