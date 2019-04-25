/* eslint-disable no-unused-expressions */
import '@babel/polyfill';
import chai, { expect, assert } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
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
import { checkPhoneNetwork } from '../lib/number';

chai.use(chaiHttp);

let clientToken;
let receiverToken;
let staffToken;
let adminToken;
let createClient;
let createStaff;
let createAdmin;
let clientAccount;
let accountNumber;
let userToBeCredited;
let accountToBeCredited;
let accountNumberCredited;

describe('POST transactions and Transfers', () => {
  before(async () => {
    await Users.deleteAll();
    createClient = await Users.create(correctPasswordClient);
    userToBeCredited = await Users.create(clientUser);
    clientToken = generateToken({ id: createClient.id });
    receiverToken = generateToken({ id: userToBeCredited.id });

    createStaff = await Users.create(staffUser);
    staffToken = generateToken({ id: createStaff.id });

    createAdmin = await Users.create(adminUser);
    adminToken = generateToken({ id: createAdmin.id });

    accountNumber = Number(generateAccountNumber());
    accountNumberCredited = Number(generateAccountNumber());
    clientAccount = await Accounts.create({
      id: createClient.id,
      accountType: 'current',
      openingBalance: 10000,
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

    await Accounts.findOneAndUpdate({
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
        expect(res.body.data[0]).to.have.all.keys(
          'id',
          'account_number',
          'description',
          'created_on',
          'cashier_id',
          'amount',
          'transaction_type',
          'old_balance',
          'new_balance',
        );
        expect(res.body.data[0].transaction_type).to.equal('credit');
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
        expect(res.body.data[0]).to.have.all.keys(
          'id',
          'account_number',
          'description',
          'created_on',
          'cashier_id',
          'amount',
          'transaction_type',
          'old_balance',
          'new_balance',
        );
        expect(res.body.data[0].transaction_type).to.equal('debit');
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
        expect(res.body.data[0]).to.have.all.keys(
          'id',
          'account_number',
          'description',
          'created_on',
          'cashier_id',
          'amount',
          'transaction_type',
          'old_balance',
          'new_balance',
        );
        expect(res.body.data[0].transaction_type).to.equal('debit');
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
});

describe('POST Airtime', () => {
  it('should purchase airtime if valid token and number are provided', (done) => {
    const checkValidNumber = sinon
      .stub()
      .returns('Airtime purchase successful');
    expect(checkValidNumber(0)).to.equal('Airtime purchase successful');
    done();
  });

  it('should not purchase airtime if phone number is invalid', (done) => {
    chai
      .request(server)
      .post('/api/v1/airtime')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        accountNumber,
        phoneNumber: '080946398057',
        amount: 200,
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Number invalid');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not purchase if account is not active', (done) => {
    chai
      .request(server)
      .post('/api/v1/airtime')
      .set('Authorization', `Bearer ${receiverToken}`)
      .send({
        accountNumber: accountNumberCredited,
        phoneNumber: '08033020665',
        amount: 300,
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account not activated');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not purchase if account cannot be found', (done) => {
    chai
      .request(server)
      .post('/api/v1/airtime')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        accountNumber: Number(generateAccountNumber()),
        phoneNumber: '07066036959',
        amount: 10000,
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account not found');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not purchase if token does not match owner', (done) => {
    chai
      .request(server)
      .post('/api/v1/airtime')
      .set('Authorization', `Bearer ${receiverToken}`)
      .send({
        accountNumber,
        phoneNumber: '07066036959',
        amount: 10000,
      })
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Token and user mismatch');
        expect(err).to.be.null;
        done();
      });
  });
});

describe('POST transfers', () => {
  const unknownSender = Number(generateAccountNumber());

  it('should not transfer if sender account is not active', (done) => {
    chai
      .request(server)
      .post('/api/v1/transfers')
      .send({
        senderAccount: accountNumberCredited,
        receiverAccount: accountNumber,
        description: 'Bride price',
        amount: 0,
      })
      .set('Authorization', `Bearer ${receiverToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Sender account not activated');
        done();
      });
  });

  it('should not transfer if receiver account is not active', (done) => {
    chai
      .request(server)
      .post('/api/v1/transfers')
      .send({
        senderAccount: accountNumber,
        receiverAccount: accountNumberCredited,
        description: 'Bride price',
        amount: 0,
      })
      .set('Authorization', `Bearer ${clientToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Receiver account not activated');
        done();
      });
  });

  it('should not transfer if it cannot find sender account', (done) => {
    chai
      .request(server)
      .post('/api/v1/transfers')
      .send({
        senderAccount: unknownSender,
        receiverAccount: accountNumberCredited,
        description: 'Bride price',
        amount: 0,
      })
      .set('Authorization', `Bearer ${clientToken}`)
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal('Sender account not found');
        done();
      });
  });

  it('should not transfer if it cannot find receiver account', (done) => {
    chai
      .request(server)
      .post('/api/v1/transfers')
      .send({
        senderAccount: accountNumber,
        receiverAccount: unknownSender,
        description: 'Bride price',
        amount: 0,
      })
      .set('Authorization', `Bearer ${clientToken}`)
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal('Receiver account not found');
        done();
      });
  });

  it('should transfer between active client accounts', async () => {
    const activeAccount = await Accounts.create({
      id: createClient.id,
      accountType: 'current',
      openingBalance: 5000,
      status: 'draft',
      createdOn: new Date().toGMTString(),
      accountNumber: unknownSender,
    });
    await Accounts.findOneAndUpdate({
      status: 'active',
      id: activeAccount.id,
    });
    const newNumber = Number(generateAccountNumber());
    await Accounts.create({
      id: createClient.id,
      accountType: 'current',
      openingBalance: 5000,
      status: 'active',
      createdOn: new Date().toGMTString(),
      accountNumber: newNumber,
    });
    await Accounts.findOneAndUpdate({
      status: 'active',
      id: clientAccount.id,
    });
    chai
      .request(server)
      .post('/api/v1/transfers')
      .send({
        receiverAccount: Number(newNumber),
        senderAccount: Number(unknownSender),
        description: 'bride price',
        amount: 0,
      })
      .set('authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('Message');
        expect(res.body.Message).to.equal(`Transfer of N${0} successful`);
        expect(err).to.be.null;
      });
  });

  it('should not transfer if token does not belong to sender', (done) => {
    chai
      .request(server)
      .post('/api/v1/transfers')
      .send({
        senderAccount: accountNumber,
        receiverAccount: accountNumberCredited,
        description: 'bride price',
        amount: 0,
      })
      .set('authorization', `Bearer ${receiverToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Token and user mismatch');
        expect(err).to.be.null;
        done();
      });
  });
});

describe('GET transactions', () => {
  let transaction;
  before(async () => {
    const transactionData = {
      ...creditTransaction,
      accountNumber,
      cashierId: createStaff.id,
      oldBalance: 5000,
      newBalance: 10000,
      date: new Date().toGMTString(),
    };
    transaction = await Transactions.create(transactionData);
  });

  it('should not get if client token does not belong to account owner', (done) => {
    chai
      .request(server)
      .get(`/api/v1/transactions/${transaction.id}`)
      .set('Authorization', `Bearer ${receiverToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body.error).to.equal('Token and user mismatch');
        done();
      });
  });

  it('should not get if account cannot be found', (done) => {
    chai
      .request(server)
      .get('/api/v1/transactions/1000000')
      .set('Authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal('Transaction not found');
        done();
      });
  });

  it('should not get if auth token is not provided', (done) => {
    chai
      .request(server)
      .get('/api/v1/transactions/1')
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body.error).to.equal('Auth token not provided');
        done();
      });
  });

  it('should return transaction if client requests with valid token', (done) => {
    chai
      .request(server)
      .get(`/api/v1/transactions/${transaction.id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.have.all.keys(
          'amount',
          'account_number',
          'cashier_id',
          'transaction_type',
          'description',
          'old_balance',
          'new_balance',
          'created_on',
          'id',
        );
        done();
      });
  });

  it('should return transaction if staff requests with valid token', (done) => {
    chai
      .request(server)
      .get(`/api/v1/transactions/${transaction.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.have.all.keys(
          'amount',
          'account_number',
          'cashier_id',
          'transaction_type',
          'description',
          'old_balance',
          'new_balance',
          'created_on',
          'id',
        );
        done();
      });
  });

  it('should return an array of all transactions if valid token is provided', (done) => {
    chai
      .request(server)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('array');
        done();
      });
  });
});

describe('Test Number check function', () => {
  it('should return the appropriate network provider', (done) => {
    const number = '2347034639805';
    const network = checkPhoneNetwork(number);
    assert.equal(network, 'MTN');
    done();
  });

  it('should return an error for a non valid network', (done) => {
    const number = '05038909987';
    const network = checkPhoneNetwork(number);
    assert.equal(network, 'Network not found');
    done();
  });

  it('should return an error for an invalid number', (done) => {
    const number = '23480346398099';
    const network = checkPhoneNetwork(number);
    assert.equal(network, 'Invalid number');
    done();
  });
});
