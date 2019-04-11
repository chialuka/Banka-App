import bcrypt from 'bcrypt-nodejs';
import jwt from 'jsonwebtoken';
import config from '../config';

const { secret } = config;

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const getNewId = len => (parseInt(len, 10) + 1);

const hashPassword = password => bcrypt.hashSync(password);

const comparePassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);

const generateToken = (data) => {
  const token = jwt.sign(data, secret, { expiresIn: '1h' });
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
