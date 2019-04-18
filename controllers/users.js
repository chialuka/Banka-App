import * as Users from '../models/users';
import {
  hashPassword,
  comparePassword,
  generateToken,
  setServerResponse,
} from '../utils';

/**
 * Create a new user after hashing password and generating token
 * @name createUser
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const createUser = async (req, res) => {
  try {
    const existingUser = await Users.findOneByEmail(req.body.email);
    if (existingUser.length > 0) {
      return setServerResponse(res, 409, {
        error: 'User with provided email already exists.',
      });
    }
    const { password } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUserObj = { ...req.body, password: hashedPassword };
    const user = await Users.create({ ...newUserObj });
    const token = generateToken({ id: user[0].id });
    delete user.password;
    return setServerResponse(res, 201, { data: { ...user, token } });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * return all the users in the database
 * @name getUsers
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const getUsers = async (_, res) => {
  try {
    const users = await Users.findAll();
    if (!users) {
      return setServerResponse(res, 404, { error: 'No users yet.' });
    }
    return setServerResponse(res, 200, { data: users });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * return a given user if the id provided is correct
 * @name getUser
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const getUser = async (req, res) => {
  try {
    const user = await Users.findOneById(Number(req.params.id));
    if (!user) {
      return setServerResponse(res, 404, { error: 'User not found' });
    }
    delete user.password;
    return setServerResponse(res, 200, { data: user });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * Provide token for signed up user to login
 * @name loginUser
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const loginUser = async (req, res) => {
  try {
    const user = await Users.findOneByEmail(req.body.email);
    if (!user) {
      return setServerResponse(res, 404, {
        error: 'Incorrect email. User not found',
      });
    }
    const isValid = await comparePassword(req.body.password, user.password);
    if (!isValid) {
      return setServerResponse(res, 401, { error: 'Incorrect password' });
    }
    const token = generateToken({ id: user.id });
    const userObj = { ...user };
    delete userObj.password;
    return setServerResponse(res, 200, { data: { ...userObj, token } });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * Update the details of the provided user. Don't update email
 * @name updateUser
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const updateUser = async (req, res) => {
  try {
    let hashedPassword = '';
    const user = await Users.findOneById(Number(req.params.id));
    if (!user) {
      return setServerResponse(res, 404, { error: 'Cannot find user' });
    }
    const { tokenOwner } = res.locals;
    if (tokenOwner.email !== user.email) {
      return setServerResponse(res, 403, { error: 'User and token mismatch' });
    }
    const { password, firstname, lastname } = req.body;
    if (password) hashedPassword = await hashPassword(password);
    const data = {
      ...(hashedPassword && { password: hashedPassword }),
      ...(firstname && { firstname }),
      ...(lastname && { lastname }),
    };
    const newUserObj = { ...user, ...data };
    const updatedUser = await Users.findOneAndUpdate(newUserObj);
    delete updatedUser.password;
    return setServerResponse(res, 200, { data: { ...updatedUser } });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * Delete a provided user from the database
 * @name deleteUser
 * @async
 * @param {Object} req,
 * @param {Object} res,
 * @returns {JSON Object}
 */
const deleteUser = async (req, res) => {
  try {
    const user = await Users.findOneById(Number(req.params.id));
    const deletedUser = await Users.findOneAndDelete(req.params.id);
    if (!user || !deletedUser) {
      return setServerResponse(res, 404, { error: 'User not found' });
    }
    return setServerResponse(res, 200, { message: 'User delete successful' });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

export {
  getUsers, getUser, updateUser, deleteUser, loginUser,
};

export default createUser;
