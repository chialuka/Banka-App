const { Users } = require("../models");

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

const deleteUser = async (req, res) => {
  try {
    const user = await Users.findOneAndDelete(req.params.user_id);
    return res.json({ user });
  } catch (error) {
    res.json({ error });
  }
};

module.exports = { getUsers, getUser, deleteUser };
