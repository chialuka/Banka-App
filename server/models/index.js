import fs from 'fs';
import path from 'path';
import util from 'util';

import getNewId, { capitalize } from '../utils';

const open = util.promisify(fs.open);
const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const append = util.promisify(fs.appendFile);
const close = util.promisify(fs.close);

const getBaseDir = file => path.resolve(__dirname, '..', 'data', file);

class Model {
  constructor(file) {
    this.file = file;
    this.results = read(getBaseDir(file))
      .then(data => JSON.parse(data))
      .catch(console.error);
  }

  async create(data) {
    const users = await this.results;
    const id = users.length > 0 ? getNewId(users[users.length - 1].id) : 1;
    data.id = id;
    users.push(data);
    const fd = await open(getBaseDir(this.file), 'w');
    await append(fd, JSON.stringify(users));
    await close(fd);
    return data;
  }

  findAll() {
    return this.results;
  }

  async findOne(param) {
    const users = await this.results;
    if (/@/.test(param)) return users.find(items => items.email === param);
    return users.find(items => items.id === Number(param));
  }

  async findOneAndUpdate(data) {
    const users = await this.results;
    const usersArray = users.filter(items => items.id !== Number(data.id));
    usersArray.push(data);
    const fd = open(getBaseDir(this.file), 'w+');
    await write(fd, JSON.stringify(usersArray));
    await close(fd);
    return data;
  }

  async findOneAndDelete(id) {
    const users = await this.results;
    const usersArray = users.filter(items => items.id !== Number(id));
    write(getBaseDir(this.file), JSON.stringify(usersArray));
    return id;
  }
}

const models = fs
  .readdirSync(getBaseDir(''))
  .filter(file => file.endsWith('.json'))
  .reduce((acc, file) => {
    const model = new Model(file);
    const name = capitalize(file.replace('.json', ''));
    acc[name] = model;
    return acc;
  }, {});

export default models;
