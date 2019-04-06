import models from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils';

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
      return res.status(409).json({
        status: 409,
        error: 'User with provided email already exists.',
      });
    }
    const { password, isAdmin } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUserObj = {
      ...req.body,
      password: hashedPassword,
    };
    // Another solution in the real world would be to have a user
    // table that staff and client will inherit from
    if (req.body.type === 'staff') newUserObj.isAdmin = isAdmin;
    const user = await Users.create({ ...newUserObj });

    const token = generateToken(user.id);
    delete user.password;
    return res.status(201).json({
      data: { ...user, token },
      status: 201,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: 'We\'re sorry about this. We\'re working to fix the problem.'
    });
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
      return res.status(401).json({ status: 401, error: 'Incorrect user details' });
    }
    const isValid = await comparePassword(req.body.password, user.password);
    if (!isValid) {
      return res.status(401).json({ status: 401, error: 'Incorrect user details' });
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
    res.status(500).json({
      status: 500,
      error: 'We\'re sorry about this. We\'re working to fix the problem.',
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.params.user_id);
    if (!user) {
      return res.json({
        error: 'User with specified id does not exist',
      });
    }
    const { password } = req.body;
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.firstname = req.body.firstname;
    const updatedUser = Users.findOneAndUpdate(user);
    delete updatedUser.password;
    res.status(200).json({
      status: 200,
      data: {
        ...updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: 'We\'re sorry about this. We\'re working to fix the problem.',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.params.user_id);
    const deletedUser = await Users.findOneAndDelete(req.params.user_id);
    if (!user || !deletedUser) {
      return res.status(400).json({ status: 400, message: 'User not found' });
    }
    return res.status(200).json({ status: 200, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: 'We\'re sorry about this. We\'re working to fix the problem.',
    });
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
