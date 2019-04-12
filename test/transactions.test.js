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
} from '../fixtures';

chai.use(chaiHttp);

const { Accounts, Users, Transactions } = models;

let clientToken;
let staffToken;
let adminToken;
let allAccounts;
let clientData;
let clientId;
let staffId;
let adminId;
let accountNumber;
let accountId;

describe('POST transactions', () => {
  before((done) => {
    Accounts.findAll().then((accounts) => {
      allAccounts = accounts;
    });
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send(staffTransaction)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        staffToken = res.body.data.token;
        staffId = res.body.data.id;
        chai
          .request(server)
          .post('/api/v1/users/auth/signup')
          .send(adminTransaction)
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body.data).to.include.key('token');
            expect(err).to.be.null;
            adminToken = res.body.data.token;
            adminId = res.body.data.id;
            chai
              .request(server)
              .post('/api/v1/users/auth/signup')
              .send(clientTransaction)
              .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body.data).to.include.key('token');
                expect(err).to.be.null;
                clientData = res.body.data;
                clientToken = res.body.data.token;
                clientId = res.body.id;
                chai
                  .request(server)
                  .post('/api/v1/accounts')
                  .send({
                    ...clientData,
                    accountType: 'current',
                    openingBalance: 50000,
                  })
                  .set('Authorization', `Bearer ${clientData.token}`)
                  .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body.data).to.include.key('accountNumber');
                    expect(err).to.be.null;
                    accountNumber = res.body.data.accountNumber;
                    accountId = res.body.data.id;
                    done();
                  });
              });
          });
      });
  });

  it('should credit client account if valid details are provided', (done) => {
    chai
      .request(server)
      .patch(`/api/v1/accounts/${accountId}`)
      .send({ status: 'active' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('data');
        expect(res.body.data).to.include.key('status');
        expect(res.body.data.status).to.equal('active');
        expect(err).to.be.null;
        chai
          .request(server)
          .post('/api/v1/transactions/')
          .send({
            ...creditTransaction,
            accountNumber,
            cashierId: staffId,
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
  });

  it('should debit client account if valid details are provided', (done) => {
    chai
      .request(server)
      .patch(`/api/v1/accounts/${accountId}`)
      .send({ status: 'active' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('data');
        expect(res.body.data).to.include.key('status');
        expect(res.body.data.status).to.equal('active');
        expect(err).to.be.null;
        chai
          .request(server)
          .post('/api/v1/transactions')
          .send({
            ...debitTransaction,
            accountNumber,
            cashierId: staffId,
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
  });

  it('should return 200 if admin token and valid details are provided', (done) => {
    const [account, ...rest] = allAccounts.reverse();
    chai
      .request(server)
      .patch(`/api/v1/accounts/${accountId}`)
      .send({ status: 'active' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('data');
        expect(res.body.data).to.include.key('status');
        expect(res.body.data.status).to.equal('active');
        expect(err).to.be.null;
        chai
          .request(server)
          .post('/api/v1/transactions')
          .send({
            ...debitTransaction,
            accountNumber,
            cashierId: adminId,
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

  it('should return an error if account is dormant', (done) => {
    chai
      .request(server)
      .patch(`/api/v1/accounts/${accountId}`)
      .send({ status: 'dormant' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('data');
        expect(res.body.data).to.include.key('status');
        expect(res.body.data.status).to.equal('dormant');
        expect(err).to.be.null;
        chai
          .request(server)
          .post('/api/v1/transactions/')
          .send({
            ...debitTransaction,
            accountNumber,
            cashierId: adminId,
          })
          .set('authorization', `Bearer ${adminToken}`)
          .end((_, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.include.key('error');
            expect(res.body.error).to.equal('Account not activated');
            done();
          });
      });
  });
});
