const { Users } = require("../models");
const { hashPassword, generateToken } = require("../utils");

const createUser = async (req, res) => {
  try {
    const existingUser = await Users.findOne(req.body.email);
    if (existingUser)
      return res.status(409).json({
        status: 409,
        error: "User with provided email already exists"
      });
    const hashedPassword = await hashPassword(req.body.password);
    const userObj = {};
    const { email, firstname, lastname, type } = req.body;
    userObj.email = email;
    userObj.firstname = firstname;
    userObj.lastname = lastname;
    userObj.password = hashedPassword;
    userObj.type = type;
    if (type === "staff") userObj.isAdmin = req.body.isAdmin;
    const user = await Users.create(userObj);
    const token = generateToken(user);
    user.token = token;
    const newUser = {};
    (newUser.status = 201), (newUser.data = user);
    return res.status(201).json({ newUser });
  } catch (error) {
    res.json({ status: 500, error: "We're sorry about this. We're working to fix the problem." });
  }
};

const getUsers = async (_, res) => {
  try {
    const users = await Users.findAll();
    return res.json({ users });
  } catch (error) {
    res.json({ error });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.params.user_id);
    return res.json({ user });
  } catch (error) {
    res.json({ error });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await Users.findOne(req.params.user_id);
    if (!user)
      return res.json({
        error: "User with specified id does not exist"
      });
    const password = req.body.password;
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.firstname = req.body.firstname;
    const updatedUser = Users.findOneAndUpdate(user);
    return res.json({ updatedUser });
  } catch (error) {
    res.json({ error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await Users.findOneAndDelete(req.params.user_id);
    return res.json({ user });
  } catch (error) {
    res.json({ error });
  }
};

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser };
