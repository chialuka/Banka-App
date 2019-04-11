import faker from 'faker';
import { truncate } from 'fs';

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

const clientUser = {
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
};

const adminUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
  isAdmin: true,
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

const staffAccount = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
  accountType: 'current',
  openingBalance: 8000,
};

const clientTransaction = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'client',
};

const staffTransaction = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
};

const adminTransaction = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
  isAdmin: true,
};

const creditTransaction = {
  amount: 5000,
  transactionType: 'credit',
  cashier: 1,
};

const debitTransaction = {
  amount: 5000,
  transactionType: 'debit',
  cashier: 1,
};

export {
  normalUser,
  wrongEmailDetail,
  existingEmailDetail,
  clientUser,
  loginUserDetails,
  staffUser,
  adminUser,
  accountUser,
  noEmailAccount,
  noTypeAccount,
  noBalanceAccount,
  stringOpeningBalance,
  invalidAccountType,
  clientAccount,
  adminAccount,
  staffAccount,
  adminAccount2,
  clientTransaction,
  staffTransaction,
  adminTransaction,
  creditTransaction,
  debitTransaction,
};
