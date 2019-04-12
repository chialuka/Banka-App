import faker from 'faker';

const wrongTypeUser = {
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

const clientUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'client',
};

const getUserStaff = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
};

const correctPasswordClient = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: 'ndukwu',
  type: 'client',
};

const correctClient = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: 'rihannandukwe@gmail.com',
  password: 'ndukwu',
  type: 'client',
};

const staffUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  type: 'staff',
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
  description: 'brideprice',
  amount: 5000,
  transactionType: 'credit',
  cashierId: 1,
};

const debitTransaction = {
  description: 'brideprice',
  amount: 5000,
  transactionType: 'debit',
  cashierId: 1,
};

const noAmountTransaction = {
  description: 'brideprice',
  transactionType: 'debit',
  cashierId: 1,
};

const noTransactionType = {
  description: 'brideprice',
  amount: 5000,
  cashierId: 1,
};

const noCashierId = {
  description: 'brideprice',
  amount: 5000,
  transactionType: 'credit',
};

export {
  wrongTypeUser,
  wrongEmailDetail,
  correctPasswordClient,
  correctClient,
  getUserStaff,
  clientUser,
  staffUser,
  accountUser,
  noEmailAccount,
  noBalanceAccount,
  noTypeAccount,
  stringOpeningBalance,
  invalidAccountType,
  clientAccount,
  staffAccount,
  adminAccount,
  adminAccount2,
  clientTransaction,
  staffTransaction,
  adminTransaction,
  creditTransaction,
  debitTransaction,
  noAmountTransaction,
  noTransactionType,
  noCashierId,
};

// user.test
// wrongTypeUser,
// wrongEmailDetail,
// correctPasswordClient,
// correctClient
// getUserStaff,
// clientUser
// staffUser


// account.test
// accountUser,
// noEmailAccount,
// noBalanceAccount,
// noTypeAccount,
// stringOpeningBalance,
// invalidAccountType,
// clientAccount,
// staffAccount,
// adminAccount,
// adminAccount2,

// transactions.test
// clientTransaction,
// staffTransaction,
// adminTransaction,
// creditTransaction,
// debitTransaction,
