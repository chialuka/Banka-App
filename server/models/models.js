const fsPromises = require("fs").promises;
const path = require("path")

const models = {};

models.baseDir = path.join(__dirname, "/../data/");

models.create = function(dir, file, data, callback) {
  fsPromises.open(models.baseDir + dir + '/' + file + '.json', 'wx')
  .then(fileHandle => {
    const dataString = JSON.stringify(data)
    fsPromises.writeFile(fileHandle, dataString)
    .then(() => callback(false))
    .catch(() => callback("Error writing to file"))
  }
  )
  .catch(() => callback("Error opening file for writing"))
  .then(fileHandle => fileHandle.close())
}

models.read = function(dir, callback) {
  fsPromises.readFile(models.baseDir + dir + '/' + '.json', 'utf8')
  .then(data => {
    const parsedData = JSON.parse(data);
    callback(false, parsedData)})
  .catch(() => callback('Error reading from file'))
}

models.update = function(dir, file, data, callback) {
  fsPromises.open(models.baseDir + dir + '/' + file + '.json', 'r+')
  .then(fileHandle => {
    const dataString = JSON.stringify(data)
    fsPromises.writeFile(fileHandle, dataString)
    .then(() => callback(false))
    .catch(() => callback('Error writing to file'))
  })
  .catch(() => callback('Error opening file for writing'))
  .then(fileHandle => fileHandle.close())
}

models.delete = function(dir, file, callback) {
  fsPromises.unlink(models.baseDir + dir + '/' + file + '.json')
  .then(()  => callback(false))
  .catch(() => callback('Error deleting file'))
}

module.exports = models;