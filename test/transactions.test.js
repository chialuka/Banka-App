/* eslint-disable no-unused-expressions */
import '@babel/polyfill';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import models from '../models';
import {
  staffTransaction,
  clientTransaction,
  adminTransaction,
  creditTransaction,
  debitTransaction,
  noAmountTransaction,
  noTransactionType,
  noCashierId,
  clientTransfer,
} from '../fixtures';
import { generateToken, generateAccountNumber } from '../utils';

chai.use(chaiHttp);

const { Accounts, Users } = models;

describe('POST transactions and Transfers', () => {
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
  let activatedCreditedAccount;

  before(async () => {
    createClient = await Users.create(clientTransaction);
    userToBeCredited = await Users.create(clientTransfer);
    clientToken = generateToken({ id: createClient.id });
    const { firstname, email, id } = createClient;

    createStaff = await Users.create(staffTransaction);
    staffToken = generateToken({ id: createStaff.id });

    createAdmin = await Users.create(adminTransaction);
    adminToken = generateToken({ id: createAdmin.id });

    accountNumber = Number(generateAccountNumber());
    accountNumberCredited = Number(generateAccountNumber());
    clientAccount = await Accounts.create({
      firstname,
      email,
      owner: id,
      accountType: 'current',
      openingBalance: 5000,
      accountNumber,
    });

    accountToBeCredited = await Accounts.create({
      ...userToBeCredited,
      owner: id,
      accountType: 'savings',
      openingBalance: 5000,
      accountNumber: accountNumberCredited,
    });

    activatedAccount = await Accounts.findOneAndUpdate({
      ...clientAccount,
      status: 'active',
    });
    activatedCreditedAccount = await Accounts.findOneAndUpdate({
      ...accountToBeCredited,
      status: 'active',
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
        expect(res.body.data).to.be.an('object');
        expect(res.body.data).to.include.key('id');
        expect(res.body.data).to.include.key('accountNumber');
        expect(res.body.data).to.include.key('description');
        expect(res.body.data).to.include.key('date');
        expect(res.body.data).to.include.key('cashierId');
        expect(res.body.data).to.include.key('amount');
        expect(res.body.data).to.include.key('transactionType');
        expect(res.body.data.transactionType).to.equal('credit');
        expect(res.body.data).to.include.key('accountBalance');
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
        expect(res.body.data).to.be.an('object');
        expect(res.body.data).to.include.key('id');
        expect(res.body.data).to.include.key('accountNumber');
        expect(res.body.data).to.include.key('description');
        expect(res.body.data).to.include.key('date');
        expect(res.body.data).to.include.key('cashierId');
        expect(res.body.data).to.include.key('amount');
        expect(res.body.data).to.include.key('transactionType');
        expect(res.body.data.transactionType).to.equal('debit');
        expect(res.body.data).to.include.key('accountBalance');
        expect(err).to.be.null;
        done();
      });
  });

  it('should return 200 if token and valid details are provided', (done) => {
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
        expect(res.body.data).to.be.an('object');
        expect(res.body.data).to.include.key('id');
        expect(res.body.data).to.include.key('accountNumber');
        expect(res.body.data).to.include.key('description');
        expect(res.body.data).to.include.key('date');
        expect(res.body.data).to.include.key('cashierId');
        expect(res.body.data).to.include.key('amount');
        expect(res.body.data).to.include.key('transactionType');
        expect(res.body.data.transactionType).to.equal('debit');
        expect(res.body.data).to.include.key('accountBalance');
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
        cashierId: 10000000,
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

  it('should transfer between clients', (done) => {
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
        done();
      });
  });
  it('should return an error if account is dormant', async () => {
    const deactivatedAccount = await Accounts.findOneAndUpdate({
      ...activatedAccount,
      status: 'dormant',
    });
    const accNumber = deactivatedAccount.accountNumber;
    chai
      .request(server)
      .post('/api/v1/transactions/')
      .send({
        ...debitTransaction,
        accountNumber: accNumber,
        cashierId: createStaff.id,
      })
      .set('authorization', `Bearer ${staffToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account not activated');
      });
  });
});
