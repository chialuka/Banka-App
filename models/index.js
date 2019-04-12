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

/**
 * @class
 */
class Model {
  constructor(file) {
    this.file = file;
  }

  async getDataFromFile() {
    const results = await read(getBaseDir(this.file));
    return JSON.parse(results);
  }

  async create(data) {
    const oldData = await this.getDataFromFile();
    const id = oldData.length > 0 ? getNewId(oldData[oldData.length - 1].id) : 1;
    const newItem = { ...data, id };
    const newData = oldData.concat(newItem);
    const fd = await open(getBaseDir(this.file), 'w+');
    await append(fd, JSON.stringify(newData));
    await close(fd);
    return newItem;
  }

  async findAll() {
    const results = await this.getDataFromFile();
    return results;
  }

  async findOne(condition, param) {
    const results = await this.getDataFromFile();
    const name = condition;
    const result = results.find(items => items[`${name}`] === param);
    return result;
  }

  async findOneAndUpdate(data) {
    const oldData = await this.getDataFromFile();
    const usersArray = oldData.filter(items => items.id !== Number(data.id));
    const newData = usersArray.concat(data);
    const sortedData = newData.sort((a, b) => a.id - b.id);
    const fd = await open(getBaseDir(this.file), 'w+');
    await write(fd, JSON.stringify(sortedData));
    await close(fd);
    return data;
  }

  async findOneAndDelete(id) {
    const results = await this.getDataFromFile();
    const usersArray = results.filter(items => items.id !== Number(id));
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
