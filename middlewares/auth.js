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
    const tokenOwner = await Users.findOne(id);
    if (!tokenOwner) {
      return setServerResponse(res, 404, {
        error: 'User with provided token not found',
      });
    }
    return tokenOwner;
  } catch (error) {
    return setServerResponse(res, 403, {
      error: 'Invalid Token. Please login',
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
  const tokenOwner = await getUserFromToken(req, res);
  const requestOwner = await Users.findOne(req.body.email);
  if (!tokenOwner) return null;
  if (!requestOwner) {
    return setServerResponse(res, 404, { error: 'User not found' });
  }
  if (tokenOwner.type !== 'client' || tokenOwner.email !== requestOwner.email) {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

const authorizeStaff = async (req, res, next) => {
  const user = await getUserFromToken(req, res);
  if (!user) return null;
  if (user.type !== 'staff') {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

const authorizeAdmin = async (req, res, next) => {
  const user = await getUserFromToken(req, res);
  if (!user) return null;
  if (!user.isAdmin || user.type === 'client') {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

export { authorizeStaff, authorizeClient, authorizeAdmin };
