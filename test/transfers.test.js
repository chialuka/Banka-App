// import '@babel/polyfill';
// import chai, { Expect } from 'chai';
// import chaiHttp from 'chai-http';
// import server from '../index';
// import { generateToken, generateAccountNumber } from '../utils';
// import models from '../models';
// import { clientTransferCredit, clientTransferDebit } from '../fixtures';

// chai.use(chaiHttp);

// const { Accounts, Users } = models;

// describe('POST transfers', () => {
//   let createDebitClient;
//   let createCreditClient;
//   let clientToken;
//   before(async () => {
//     createDebitClient = await Users.create(clientTransferDebit);
//     createCreditClient = await Users.create(clientTransferCredit);
//     clientToken = generateToken({ id: clientTransferDebit.id });
//     const { firstname, email, id } = createDebitClient;
  
//     createStaff = await Users.create(staffTransaction);
//     staffToken = generateToken({ id: createStaff.id });
  
//     createAdmin = await Users.create(adminTransaction);
//     adminToken = generateToken({ id: createAdmin.id });
  
//     accountNumber = Number(generateAccountNumber());
//     clientAccount = await Accounts.create({
//       firstname,
//       email,
//       owner: id,
//       accountType: 'current',
//       openingBalance: 5000,
//       accountNumber,
//     });
  
//     activatedAccount = await Accounts.findOneAndUpdate({
//       ...clientAccount,
//       status: 'active',
//     });

//   })
// });
