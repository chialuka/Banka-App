const bcrypt = require("bcrypt");

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);

const getId = len => {
  const newId = len + 1;
  return newId;
};

const hashPassword = password =>
  bcrypt.hash(password, 10).then(hash => {
    return hash;
  });
module.exports = { capitalize, getId, hashPassword };
