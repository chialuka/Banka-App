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
  email: normalUser.email,
  password: faker.internet.password(),
  type: faker.name.jobTitle(),
};

const loginUserDetails = {
  email: normalUser.email,
  password: 'monkey',
};

const createUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'client',
};

const staffUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
  accountType: 'current',
  openingBalance: 8000,
};

const accountUser = {
  email: faker.internet.email(),
  accountType: 'savings',
  openingBalance: '1000',
};

const noEmailAccount = {
  accountType: 'current',
  openingBalance: '100000',
};

const noTypeAccount = {
  email: faker.internet.email(),
  openingBalance: '568900',
};

const noBalanceAccount = {
  email: faker.internet.email(),
  accountType: 'current',
};

const stringOpeningBalance = {
  email: faker.internet.email(),
  accountType: 'savings',
  openingBalance: 'hello world',
};

const invalidAccountType = {
  email: faker.internet.email(),
  accountType: faker.name.jobTitle(),
  openingBalance: '8000',
};

const clientAccount = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'client',
  accountType: 'current',
  openingBalance: 8000,
};

const adminAccount = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
  isAdmin: true,
  accountType: 'current',
  openingBalance: 8000,
};

const adminAccount2 = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
  isAdmin: true,
  accountType: 'current',
  openingBalance: 8000,
};

const staffToken = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
  accountType: 'current',
  openingBalance: 8000,
};

const clientToken = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'client',
  accountType: 'current',
  openingBalance: 8000,
};

export {
  normalUser,
  wrongEmailDetail,
  existingEmailDetail,
  createUser,
  loginUserDetails,
  staffUser,
  accountUser,
  noEmailAccount,
  noTypeAccount,
  noBalanceAccount,
  stringOpeningBalance,
  invalidAccountType,
  clientAccount,
  adminAccount,
  staffToken,
  clientToken,
  adminAccount2,
};
