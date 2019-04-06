import faker from 'faker';

const normalUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const wrongEmailDetail = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.name.firstName(),
  password: faker.internet.password()
};

const existingEmailDetail = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: 'ninja007@jideofor.com',
  password: faker.internet.password(),
};

const staffUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isAdmin: true,
  type: 'staff',
};

const loginUserDetails = {
  email: 'ninja007@jideofor.com',
  password: 'monkey',
};

const adminUser = {};

export default normalUser;

export {
  wrongEmailDetail,
  existingEmailDetail,
  staffUser,
  adminUser,
  loginUserDetails,
};
