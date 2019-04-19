import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { setServerResponse } from '../utils';
import * as Users from '../models/users';

dotenv.config();

const { SECRET } = process.env;

const verifyJwt = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return setServerResponse(res, 403, { error: 'Auth token not provided' });
    }
    const [, token] = header.split(' ');
    const { id } = jwt.verify(token, SECRET);
    const tokenOwner = await Users.findOne('id', Number(id));
    if (!tokenOwner) {
      return setServerResponse(res, 404, {
        error: 'User with provided token not found',
      });
    }
    res.locals.tokenOwner = tokenOwner;
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
  if (!tokenOwner) return null;
  if (tokenOwner.type !== 'client') {
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
