import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { setServerResponse } from '../utils';
import * as Users from '../models/users';

dotenv.config();

const { SECRET } = process.env;

/**
 * Verify the token provided by user and
 * get the user whose ID the token was used to sign in
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} user object of the owner token was assigned to
 */
const verifyJwt = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return setServerResponse(res, 403, { error: 'Auth token not provided' });
    }
    const [, token] = header.split(' ');
    const { id } = jwt.verify(token, SECRET);
    const tokenOwner = await Users.findOneById(id);
    if (!tokenOwner) {
      return setServerResponse(res, 404, {
        error: 'User with provided token not found',
      });
    }
    res.locals.tokenOwner = tokenOwner;
    return tokenOwner;
  } catch (error) {
    return setServerResponse(res, 401, {
      error: 'Invalid Token. Please login',
    });
  }
};

/**
  * calls function that gets the user from the token
  * @param {Object} req
  * @param {Object} res
  * @returns {function} verifyJwt function
  */
const getUserFromToken = async (req, res) => {
  try {
    return verifyJwt(req, res);
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * Find if the token provided is for the client making the request
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Function} next function on the middleware chain if the token
 * was assigned to a client.
 */
const authorizeClient = async (req, res, next) => {
  const tokenOwner = await getUserFromToken(req, res);
  if (!tokenOwner) return null;
  if (tokenOwner.is_staff) {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

/**
 * Middleware to authorize staff
 * @name authorizeStaff
 * @async
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Function} the next function that calls the next function
 */
const authorizeStaff = async (req, res, next) => {
  const user = await getUserFromToken(req, res);
  if (!user) return null;
  if (!user.is_staff) {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

/**
 * Middleware for authorizing admin
 * @name authorizeAdmin
 * @async
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Function} next function to show authentication is successful
 */
const authorizeAdmin = async (req, res, next) => {
  const owner = await getUserFromToken(req, res);
  if (!owner) return null;
  if (!owner.is_admin) {
    return setServerResponse(res, 403, { error: 'User not authorized' });
  }
  return next();
};

/**
 * For paths accessible to all users but require login
 * @name authenticateLogin
 * @aync
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Function} next function that shows the user
 * passed the authentication
 */
const authenticateLogin = async (req, res, next) => {
  const loggedInUser = await getUserFromToken(req, res);
  if (!loggedInUser) return null;
  return next();
};

export {
  authorizeStaff, authorizeClient, authorizeAdmin, authenticateLogin,
};
