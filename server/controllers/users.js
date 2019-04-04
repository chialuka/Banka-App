const { Users } = require("../models");
const { hashPassword } = require("../utils");

const createUser = async (req, res) => {
  try {
    const existingUser = await Users.findOne(req.body.email);
    if (existingUser)
      return res.json({ Error: "User with provided email already exists" });
    const hashedPassword = await hashPassword(req.body.password);
    const userObj = {};
    const { email, firstname, lastname, type } = req.body;
    userObj.email = email;
    userObj.firstname = firstname;
    userObj.lastname = lastname;
    userObj.password = hashedPassword;
    userObj.type = type;
    if (type === "staff") userObj.isAdmin = req.body.isAdmin;
    const newUser = await Users.create(userObj);
    return res.json({ newUser });
  } catch (error) {
    res.json({ error });
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
        Error: "User with specified id does not exist"
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
