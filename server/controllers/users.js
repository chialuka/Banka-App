import models from '../models';
import {
  hashPassword,
  comparePassword,
  generateToken,
  setServerResponse,
} from '../utils';

const { Users } = models;

/**
 * @name createUser
 * @param {Object} req
 * @param {Object} res
 * @returns {Object}
 */
const createUser = async (req, res) => {
  try {
    const existingUser = await Users.findOne(req.body.email);
    if (existingUser) {
      return setServerResponse(res, 409, {
        error: 'User with provided email already exists.',
      });
    }
    const { password, type } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUserObj = {
      ...req.body,
      password: hashedPassword,
    };
    if (type === 'client') {
      delete newUserObj.isAdmin;
    }
    // Another solution in the real world would be to have a user
    // table that staff and client will inherit from
    const user = await Users.create({ ...newUserObj });
    const token = generateToken({ id: user.id });
    delete user.password;
    return setServerResponse(res, 201, { data: { ...user, token } });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * @name getUsers
 * @param {Object} req
 * @param {Object} res
 * @returns {Object}
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
 * @name getUser
 * @param {Object} req
 * @param {Object} res
 * @returns {Object}
 */
const getUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.params.user_id);
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
 * @name loginUser
 * @param {Object} req
 * @param {Object} res
 * @returns {Object}
 */

const loginUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.body.email);
    if (!user) {
      return setServerResponse(res, 404, { error: 'User not found' });
    }
    const isValid = await comparePassword(req.body.password, user.password);
    if (!isValid) {
      return setServerResponse(res, 401, { error: 'Incorrect user details' });
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
 * @name updateUser
 * @param {Object} req
 * @param {Object} res
 * @returns {Object}
 */
const updateUser = async (req, res) => {
  try {
    let hashedPassword = '';
    const user = await Users.findOne(req.params.user_id);
    if (!user) {
      return setServerResponse(res, 404, { error: 'User does not exist' });
    }
    const { password, firstname, lastname } = req.body;
    if (password) {
      hashedPassword = await hashPassword(password);
    }
    const data = {
      ...(hashedPassword && { password: hashedPassword }),
      ...(firstname && { firstname }),
      ...(lastname && { lastname }),
    };
    const newUserObj = {
      ...user,
      ...data,
    };
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
 * @name deleteUser
 * @param {Object} req,
 * @param {Object} res,
 * @returns {Object}
 */
const deleteUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.params.user_id);
    const deletedUser = await Users.findOneAndDelete(req.params.user_id);
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
