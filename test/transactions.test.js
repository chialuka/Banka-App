/* eslint-disable no-unused-expressions */
import '@babel/polyfill';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import * as Transactions from '../models/transactions';
import * as Accounts from '../models/accounts';
import * as Users from '../models/users';
import {
  creditTransaction,
  debitTransaction,
  noAmountTransaction,
  noTransactionType,
  noCashierId,
  correctPasswordClient,
  staffUser,
  adminUser,
  clientUser,
} from '../fixtures';
import { generateToken, generateAccountNumber } from '../utils';

chai.use(chaiHttp);

let clientToken;
let staffToken;
let adminToken;
let createClient;
let createStaff;
let createAdmin;
let clientAccount;
let accountNumber;
let activatedAccount;
let userToBeCredited;
let accountToBeCredited;
let accountNumberCredited;

describe('POST transactions and Transfers', () => {
  before(async () => {
    await Users.deleteAll();
    createClient = await Users.create(correctPasswordClient);
    userToBeCredited = await Users.create(clientUser);
    clientToken = generateToken({ id: createClient.id });

    createStaff = await Users.create(staffUser);
    staffToken = generateToken({ id: createStaff.id });

    createAdmin = await Users.create(adminUser);
    adminToken = generateToken({ id: createAdmin.id });

    accountNumber = Number(generateAccountNumber());
    accountNumberCredited = Number(generateAccountNumber());
    clientAccount = await Accounts.create({
      id: createClient.id,
      accountType: 'current',
      openingBalance: 5000,
      status: 'draft',
      createdOn: new Date().toGMTString(),
      accountNumber,
    });

    accountToBeCredited = await Accounts.create({
      id: userToBeCredited.id,
      accountType: 'savings',
      openingBalance: 5000,
      status: 'draft',
      createdOn: new Date().toGMTString(),
      accountNumber: accountNumberCredited,
    });

    activatedAccount = await Accounts.findOneAndUpdate({
      status: 'active',
      id: clientAccount.id,
    });
  });

  it('should credit client account if valid details are provided', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({
        ...creditTransaction,
        accountNumber,
        cashierId: createStaff.id,
      })
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.data[0]).to.be.an('object');
        expect(res.body.data[0]).to.include.key('id');
        expect(res.body.data[0]).to.include.key('account_number');
        expect(res.body.data[0]).to.include.key('description');
        expect(res.body.data[0]).to.include.key('created_on');
        expect(res.body.data[0]).to.include.key('cashier_id');
        expect(res.body.data[0]).to.include.key('amount');
        expect(res.body.data[0]).to.include.key('transaction_type');
        expect(res.body.data[0].transaction_type).to.equal('credit');
        expect(res.body.data[0]).to.include.key('old_balance');
        expect(res.body.data[0]).to.include.key('new_balance');
        expect(err).to.be.null;
        done();
      });
  });

  it('should debit client account if valid details are provided', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions')
      .send({
        ...debitTransaction,
        accountNumber,
        cashierId: createStaff.id,
      })
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.data[0]).to.be.an('object');
        expect(res.body.data[0]).to.include.key('id');
        expect(res.body.data[0]).to.include.key('account_number');
        expect(res.body.data[0]).to.include.key('description');
        expect(res.body.data[0]).to.include.key('created_on');
        expect(res.body.data[0]).to.include.key('cashier_id');
        expect(res.body.data[0]).to.include.key('amount');
        expect(res.body.data[0]).to.include.key('transaction_type');
        expect(res.body.data[0].transaction_type).to.equal('debit');
        expect(res.body.data[0]).to.include.key('old_balance');
        expect(res.body.data[0]).to.include.key('new_balance');
        expect(err).to.be.null;
        done();
      });
  });

  it('should return 200 if admin token and valid details are provided', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions')
      .send({
        ...debitTransaction,
        accountNumber,
        cashierId: createAdmin.id,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.data[0]).to.be.an('object');
        expect(res.body.data[0]).to.include.key('id');
        expect(res.body.data[0]).to.include.key('account_number');
        expect(res.body.data[0]).to.include.key('description');
        expect(res.body.data[0]).to.include.key('created_on');
        expect(res.body.data[0]).to.include.key('cashier_id');
        expect(res.body.data[0]).to.include.key('amount');
        expect(res.body.data[0]).to.include.key('transaction_type');
        expect(res.body.data[0].transaction_type).to.equal('debit');
        expect(res.body.data[0]).to.include.key('old_balance');
        expect(res.body.data[0]).to.include.key('new_balance');
        expect(err).to.be.null;
        done();
      });
  });

  it('should fail if client token is provided', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions')
      .send({ ...creditTransaction, accountNumber })
      .set('Authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not authorized');
        expect(err).to.be.null;
        done();
      });
  });

  it('should fail if debit amount is greater than account balance', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions')
      .send({
        ...debitTransaction,
        amount: 200000000,
        accountNumber,
        cashierId: createAdmin.id,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Overdraft disallowed');
        expect(err).to.be.null;
        done();
      });
  });

  it('should fail if token used does not belong to user', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions')
      .send({
        ...debitTransaction,
        accountNumber,
        cashierId: createAdmin.id,
      })
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User and token mismatch');
        expect(err).to.be.null;
        done();
      });
  });

  it('should return an error if amount is omitted', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send(noAmountTransaction)
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.contains('"amount" is required');
        done();
      });
  });

  it('should return an error if transaction type is omitted', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send(noTransactionType)
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.contains('"transactionType" is required');
        done();
      });
  });

  it('should return an error if account number is omitted', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send(creditTransaction)
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.contains('"accountNumber" is required');
        done();
      });
  });

  it('should return an error if account is dormant', async () => {
    const newAccountNumber = Number(generateAccountNumber());
    const inActiveAccount = await Accounts.create({
      id: createClient.id,
      accountType: 'current',
      openingBalance: 5000,
      status: 'draft',
      createdOn: new Date().toGMTString(),
      accountNumber: newAccountNumber,
    });
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({
        ...debitTransaction,
        accountNumber: Number(inActiveAccount.account_number),
        cashierId: createStaff.id,
      })
      .set('authorization', `Bearer ${staffToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account not activated');
      });
  });

  it('should return an error if cashier ID is omitted', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send(noCashierId)
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.contains('"cashierId" is required');
        done();
      });
  });

  it('should return an error if amount is not a number', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({ ...creditTransaction, amount: 'amount' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"amount" must be a number');
        done();
      });
  });

  it('should return an error if account Number is not a number', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({ ...creditTransaction, accountNumber: 'accountNumber' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"accountNumber" must be a number');
        done();
      });
  });

  it('should return an error if cashier ID is not a number', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({ ...debitTransaction, cashierId: 'id' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"cashierId" must be a number');
        done();
      });
  });

  it('should return an error if staff making request cannot be found', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({
        ...debitTransaction,
        accountNumber,
        cashierId: 100000,
      })
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Staff not found');
        done();
      });
  });

  it('should return an error if account Number is invalid', (done) => {
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({ ...debitTransaction, accountNumber: 4343456890 })
      .set('authorization', `Bearer ${adminToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors).to.include(
          '"accountNumber" must be larger than or equal to 5000000000',
        );
        done();
      });
  });

  xit('should transfer between clients', async () => {
    await Accounts.findOneAndUpdate({
      status: 'active',
      id: accountToBeCredited.id,
    });
    const amount = 0;
    const receiverAccount = accountNumberCredited;
    chai
      .request(server)
      .post('/api/v1/transfers')
      .send({
        senderAccount: accountNumber,
        receiverAccount,
        description: 'bride price',
        amount,
      })
      .set('authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('Message');
        expect(res.body.Message).to.equal(`Transfer of N${0} successful`);
        expect(err).to.be.null;
      });
  });
});
