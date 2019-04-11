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
} from '../fixtures';

chai.use(chaiHttp);

const { Accounts, Users, Transactions } = models;

let clientToken;
let staffToken;
let adminToken;
let allAccounts;

describe('POST transactions', () => {
  before((done) => {
    Accounts.findAll().then((accounts) => {
      allAccounts = accounts;
    });
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(staffTransaction)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        staffToken = res.body.data.token;
        chai
          .request(server)
          .post('/api/users/auth/signup')
          .send(clientTransaction)
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body.data).to.include.key('token');
            expect(err).to.be.null;
            clientToken = res.body.data.token;
            chai
              .request(server)
              .post('/api/users/auth/signup')
              .send(adminTransaction)
              .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body.data).to.include.key('token');
                expect(err).to.be.null;
                adminToken = res.body.data.token;
                done();
              });
          });
      });
  });

  it('should credit client account if valid details are provided', (done) => {
    const [account, ...rest] = allAccounts.reverse();
    chai
      .request(server)
      .patch(`/api/accounts/${account.id}`)
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
          .post(`/api/accounts/${account.id}`)
          .send({ ...creditTransaction, accountNumber: account.accountNumber })
          .set('Authorization', `Bearer ${staffToken}`)
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body.data).to.be.an('object');
            expect(res.body.data).to.include('transactionId');
            expect(res.body.data).to.include('accountNumber');
            expect(res.body.data).to.include('amount');
            expect(res.body.data).to.include('transactionType');
            expect(res.body.data.transactionType).to.equal('credit');
            expect(res.body.data).to.include('accountBalance');
            expect(err).to.be.null;
            done();
          });
      });
  });

  it('should debit client account if valid details are provided', (done) => {
    const [account, ...rest] = allAccounts.reverse();
    chai
      .request(server)
      .patch(`/api/accounts/${account.id}`)
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
          .post(`/api/accounts/${account.id}`)
          .send({ ...debitTransaction, accountNumber: account.accountNumber })
          .set('Authorization', `Bearer ${staffToken}`)
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body.data).to.be.an('object');
            expect(res.body.data).to.include('transactionId');
            expect(res.body.data).to.include('accountNumber');
            expect(res.body.data).to.include('amount');
            expect(res.body.data).to.include('transactionType');
            expect(res.body.data.transactionType).to.equal('debit');
            expect(res.body.data).to.include('accountBalance');
            expect(err).to.be.null;
            done();
          });
      });
  });

  it('should return 200 if admin token and valid details are provided', (done) => {
    const [account, ...rest] = allAccounts.reverse();
    chai
      .request(server)
      .patch(`/api/accounts/${account.id}`)
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
          .post(`/api/accounts/${account.id}`)
          .send({ ...debitTransaction, accountNumber: account.accountNumber })
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body.data).to.be.an('object');
            expect(res.body.data).to.include('transactionId');
            expect(res.body.data).to.include('accountNumber');
            expect(res.body.data).to.include('amount');
            expect(res.body.data).to.include('transactionType');
            expect(res.body.data.transactionType).to.equal('debit');
            expect(res.body.data).to.include('accountBalance');
            expect(err).to.be.null;
            done();
          });
      });
  });

  it('should fail if client token is provided', (done) => {
    const [account, ...rest] = allAccounts.reverse();
    chai
      .request(server)
      .post(`/api/accounts/${account.id}`)
      .send({ ...creditTransaction, accountNumber: account.accountNumber })
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
      .post('/api/accounts/')
      .send({ ...creditTransaction, amount: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"amount" is required');
        done();
      });
  });

  it('should return an error if transaction type is omitted', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send({ ...debitTransaction, transactionType: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"transactionType" is required');
        done();
      });
  });

  it('should return an error if account number is omitted', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send(creditTransaction)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"accountnumber" is required');
        done();
      });
  });

  it('should return an error if cashier ID is omitted', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send({ ...creditTransaction, cashierId: '' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"cashierId" is required');
        done();
      });
  });

  it('should return an error if amount is not a number', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send({ ...creditTransaction, amount: 'amount' })
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
      .post('/api/accounts/')
      .send({ ...creditTransaction, accountNumber: 'accountNumber' })
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
      .post('/api/accounts/')
      .send({ ...debitTransaction, cashierId: 'id' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"cashierId" must be a number');
        done();
      });
  });

  it('should return an error if account Number is invalid', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send({ ...debitTransaction, accountNumber: 4343456890 })
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors).to.equal('Account not found');
        done();
      });
  });

  it('should return an error if account is dormant', (done) => {
    const [, account, ...rest] = allAccounts;
    chai
      .request(server)
      .patch(`/api/accounts/${account.id}`)
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
          .post('/api/accounts/')
          .send({ ...debitTransaction, accountNumber: account.accountNumber })
          .end((_, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.include.key('errors');
            expect(res.body.errors).to.equal('Account not found');
            done();
          });
      });
  });
});
