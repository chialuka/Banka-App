import jwt from 'jsonwebtoken';
import { setServerResponse } from '../utils';
import config from '../config';
import models from '../models';

const { secret } = config;

const { Users } = models;

const authorizer = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return setServerResponse(res, 403, { error: 'Auth token not provided' });
    }
    const bearer = header.split(' ');
    try {
      const token = jwt.verify(bearer[1], secret);
      const user = await Users.findOne(token.payload);
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
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

const authorizeClient = async (req, res, next) => {
  const user = await authorizer(req, res);
  if (user.type !== 'client') {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

const authorizeStaff = async (req, res, next) => {
  const user = await authorizer(req, res);
  if (user.type !== 'staff') {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

export default authorizeClient;
export { authorizeStaff };
