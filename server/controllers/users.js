import models from '../models';
import {
  hashPassword, comparePassword, generateToken, setErrorResponse,
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
      return setErrorResponse(
        res, 409, 'User with provided email already exists.',
      );
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

    const token = generateToken(user.id);
    delete user.password;
    return res.status(201).json({
      data: { ...user, token },
      status: 201,
    });
  } catch (error) {
    setErrorResponse(
      res, 500, 'We\'re sorry about this. We\'re working to fix the problem.',
    );
  }
};

const getUsers = async (_, res) => {
  try {
    const users = await Users.findAll();
    users.map(item => delete item.password);
    return res.status(200).json({ status: 200, users });
  } catch (error) {
    res.json({ error });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.params.user_id);
    delete user.password;
    return res.status(200).json({ status: 200, user });
  } catch (error) {
    res.status(500).json({ error });
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
      return setErrorResponse(res, 404, 'User not found');
    }
    const isValid = await comparePassword(req.body.password, user.password);
    if (!isValid) {
      return setErrorResponse(res, 401, 'Incorrect user details');
    }
    const token = generateToken(user.id);
    const userObj = { ...user };
    delete userObj.password;
    res.status(200).json({
      status: 200,
      data: {
        ...userObj,
        token,
      },
    });
  } catch (error) {
    setErrorResponse(res, 500, 'We\'re sorry about this. We\'re working to fix the problem.');
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
      return setErrorResponse(res, 404, 'User requested does not exist');
    }
    const {
      password, firstname, lastname,
    } = req.body;
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
    res.status(200).json({
      status: 200,
      data: {
        ...updatedUser,
      },
    });
  } catch (error) {
    setErrorResponse(
      res, 500, 'We\'re sorry about this. We\'re working to fix the problem.',
    );
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
      return setErrorResponse(res, 404, 'User not found');
    }
    return res.status(200).json({
      status: 200,
      message: 'User deleted successfully',
    });
  } catch (error) {
    setErrorResponse(
      res, 500, 'We\'re sorry about this. We\'re working to fix the problem.',
    );
  }
};

export {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
};

export default createUser;
