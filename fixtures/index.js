import faker from 'faker';

const clientUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isStaff: false,
  isAdmin: false,
};

const correctPasswordClient = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: 'ndukwu',
  isStaff: false,
  isAdmin: false,
};

const staffUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isStaff: true,
  isAdmin: true,
};

const adminUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isStaff: true,
  isAdmin: true,
};

const accountUser = {
  id: 1,
  accountType: 'savings',
  openingBalance: '1000',
};

const noIdAccount = {
  accountType: 'current',
  openingBalance: '100000',
};

const noTypeAccount = {
  id: 1,
  openingBalance: '568900',
};

const noBalanceAccount = {
  id: 1,
  accountType: 'current',
};

const stringOpeningBalance = {
  id: 1,
  accountType: 'savings',
  openingBalance: 'hello world',
};

const invalidAccountType = {
  id: 1,
  accountType: faker.name.jobTitle(),
  openingBalance: '8000',
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
  correctPasswordClient,
  clientUser,
  staffUser,
  adminUser,
  accountUser,
  noIdAccount,
  noBalanceAccount,
  noTypeAccount,
  stringOpeningBalance,
  invalidAccountType,
  creditTransaction,
  debitTransaction,
  noAmountTransaction,
  noTransactionType,
  noCashierId,
};
