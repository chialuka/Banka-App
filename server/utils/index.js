const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = require("../config");

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const getId = len => {
  const newId = len + 1;
  return newId;
};

const hashPassword = password =>
  bcrypt.hash(password, 10).then(hash => {
    return hash;
  });

const generateToken = data => {
  const token = jwt.sign({ payload: data }, secret.secret, { expiresIn: "1h" });
  return token;
};

module.exports = { capitalize, getId, hashPassword, generateToken };
