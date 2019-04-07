import faker from 'faker';

const normalUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: faker.name.jobTitle(),
};

const wrongEmailDetail = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.name.firstName(),
  password: faker.internet.password(),
  type: faker.name.jobTitle(),
};

const existingEmailDetail = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: 'ninja007@jideofor.com',
  password: faker.internet.password(),
  type: faker.name.jobTitle(),
};

const loginUserDetails = {
  email: 'ninja007@jideofor.com',
  password: 'monkey',
};

const createUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: faker.name.jobTitle(),
};

export default normalUser;

export {
  wrongEmailDetail,
  existingEmailDetail,
  createUser,
  loginUserDetails,
};
