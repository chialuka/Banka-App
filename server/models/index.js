const fs = require("fs");
const path = require("path");
const util = require("util");
const { capitalize } = require("../utils");

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const close = util.promisify(fs.close);

class Model {
  constructor(file) {
    this.file = file;
    this.results = read(path.resolve(__dirname, "..", "data", file))
      .then(data => JSON.parse(data))
      .catch(console.error);
  }

  create(data) {
  }

  findAll() {
    return this.results;
  }

  async findOne(id) {
    const user = await this.results;
    return user.find(items => items.id === parseInt(id));
  }

  findOneAndUpdate() {

  }

  async findOneAndDelete(id) {
    const user = await this.results;
    const usersArray = user.filter(items => items.id !== parseInt(id));
    const userString = JSON.stringify(usersArray);
    return write(
      path.resolve(__dirname, "..", "data", this.file),
      userString
    );
  }
}

const models = fs
  .readdirSync(path.resolve(__dirname, "..", "data"))
  .filter(file => file.endsWith(".json"))
  .reduce((acc, file) => {
    const model = new Model(file);
    const name = capitalize(file.replace(".json", ""));
    acc[name] = model;
    return acc;
  }, {});

module.exports = models;