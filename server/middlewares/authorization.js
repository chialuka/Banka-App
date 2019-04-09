import jwt from 'jsonwebtoken';
import { setServerResponse } from '../utils';
import config from '../config';
import models from '../models';

const { secret } = config;
const { Users } = models;

const verifyJwt = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return setServerResponse(res, 403, { error: 'Auth token not provided' });
    }
    const [, token] = header.split(' ');
    const { id } = jwt.verify(token, secret);
    const user = await Users.findOne(id);
    if (!user) {
      return setServerResponse(res, 404, {
        error: 'User with provided token not found',
      });
    }
    return user;
  } catch (error) {
    return setServerResponse(res, 403, {
      error: 'Token expired. Please login',
    });
  }
};

const getUserFromToken = async (req, res) => {
  try {
    return verifyJwt(req, res);
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

const authorizeClient = async (req, res, next) => {
  const user = await getUserFromToken(req, res);
  if (user.type !== 'client') {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

const authorizeStaff = async (req, res, next) => {
  const user = await getUserFromToken(req, res);
  if (user.type !== 'staff') {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

export { authorizeStaff, authorizeClient };
