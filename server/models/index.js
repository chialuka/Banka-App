const fs = require("fs");
const path = require("path");
const util = require("util");

const { capitalize } = require("../utils");
const { getId } = require("../utils");

const open = util.promisify(fs.open);
const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const append = util.promisify(fs.appendFile);
const close = util.promisify(fs.close);

const baseDir = path.resolve(__dirname, "..", "data");

class Model {
  constructor(file) {
    this.file = file;
    this.results = read(path.resolve(baseDir, file))
      .then(data => JSON.parse(data))
      .catch(console.error);
  }

  async create(data) {
    const users = await this.results;
    const id = users.length > 0 ? getId(users[users.length - 1].id) : 1;
    data.id = id;
    users.push(data);
    open(path.resolve(baseDir, this.file), "w").then(fd => {
      append(fd, JSON.stringify(users)).then(() => close(fd));
    });
    return data;
  }

  findAll() {
    return this.results;
  }

  async findOne(id) {
    const users = await this.results;
    if (id.includes("@")) return users.find(items => items.email === id);
    return users.find(items => items.id === parseInt(id));
  }

  async findOneAndUpdate(data) {
    const users = await this.results;
    const usersArray = users.filter(items => items.id !== parseInt(data.id));
    usersArray.push(data);
    return open(path.resolve(baseDir, this.file), "w+").then(fd => {
      write(fd, JSON.stringify(usersArray)).then(() => close(fd));
    });
  }

  async findOneAndDelete(id) {
    const users = await this.results;
    const usersArray = users.filter(items => items.id !== parseInt(id));
    return write(path.resolve(baseDir, this.file), JSON.stringify(usersArray));
  }
}

const models = fs
  .readdirSync(baseDir)
  .filter(file => file.endsWith(".json"))
  .reduce((acc, file) => {
    const model = new Model(file);
    const name = capitalize(file.replace(".json", ""));
    acc[name] = model;
    return acc;
  }, {});

module.exports = models;
