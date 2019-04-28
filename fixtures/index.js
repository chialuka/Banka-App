import faker from 'faker';

const clientUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const correctPasswordClient = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: 'ndukwu',
};

const staffUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isStaff: true,
  isAdmin: false,
};

const adminUser = {
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isAdmin: true,
};

const accountUser = {
  accountType: 'Savings',
  openingBalance: '1000',
};

const noIdAccount = {
  accountType: 'Current',
  openingBalance: '100000',
};

const noTypeAccount = {
  openingBalance: '568900',
};

const noBalanceAccount = {
  accountType: 'Current',
};

const stringOpeningBalance = {
  accountType: 'Savings',
  openingBalance: 'hello world',
};

const invalidAccountType = {
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
