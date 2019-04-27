/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import server from '../index';
import * as Users from '../models/users';
import * as Accounts from '../models/accounts';
import {
  accountUser,
  noIdAccount,
  noBalanceAccount,
  noTypeAccount,
  stringOpeningBalance,
  invalidAccountType,
  clientUser,
  staffUser,
  adminUser,
  correctPasswordClient,
} from '../fixtures';
import { generateToken, generateAccountNumber } from '../utils';

chai.use(chaiHttp);

let clientToken;
let staffToken;
let client;
let newUser;
let staff;
let account;
let account2;
let admin;
let adminToken;
let newToken;

describe('POST accounts', () => {
  before(async () => {
    await Users.deleteAll();
    await Accounts.deleteAll();
    client = await Users.create(clientUser);
    staff = await Users.create(staffUser);
    clientToken = generateToken({ id: client.id });
    staffToken = generateToken({ id: staff.id });
  });

  it('should not create an account without authenticating login', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send(accountUser)
      .end((_, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Auth token not provided');
        done();
      });
  });

  it('should return an error if account type is omitted', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send(noTypeAccount)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('accountType is required');
        done();
      });
  });

  it('should return an error if opening balance is not provided', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send(noBalanceAccount)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('openingBalance is required');
        done();
      });
  });

  it('should return an error if opening balance is not a number', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send(stringOpeningBalance)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('openingBalance must be a number');
        done();
      });
  });

  it('should return an error if account type is not savings or current', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send(invalidAccountType)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('accountType must be one of [Savings, Current]');
        done();
      });
  });

  it('should create an account if valid details are provided', async () => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send({
        accountType: 'Current',
        openingBalance: 10000,
      })
      .set('authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.include.key('data');
        expect(res.body.data[0]).to.have.all.keys(
          'account_number',
          'account_balance',
          'account_type',
          'status',
          'owner',
          'created_on',
          'id',
        );
        expect(err).to.be.null;
      });
  });

  it('should not create account if token provided is not for client', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send(accountUser)
      .set('authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not authorized');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not create account if the owner does not exist', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send({
        ...accountUser,
      })
      .set('authorization', 'Bearer ojoro')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.include.key('error');
        expect(err).to.be.null;
        done();
      });
  });

  it('should create account for token owner only', async () => {
    newUser = await Users.create(correctPasswordClient);
    newToken = generateToken({ id: newUser.id });
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send({
        ...accountUser,
      })
      .set('authorization', `Bearer ${newToken}`)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.include.key('data');
        expect(err).to.be.null;
      });
  });
});

describe('GET accounts', () => {
  let newAccount;
  let activeAccount;
  before(async () => {
    newAccount = await Accounts.create({
      id: client.id,
      accountType: 'Savings',
      openingBalance: 10000,
      status: 'dormant',
      accountNumber: generateAccountNumber(),
      createdOn: new Date().toGMTString(),
    });
    activeAccount = await Accounts.create({
      id: client.id,
      accountType: 'Savings',
      openingBalance: 10000,
      status: 'active',
      accountNumber: generateAccountNumber(),
      createdOn: new Date().toGMTString(),
    });
  });

  it('should return transactions made with an account', (done) => {
    chai
      .request(server)
      .get(`/api/v1/accounts/transactions/${activeAccount.id}`)
      .set('Authorization', `Bearer ${newToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('array');
        done();
      });
  });

  it('should get active accounts if specified in the query string', (done) => {
    chai
      .request(server)
      .get('/api/v1/accounts/?status=active')
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data[0].status).to.equal('active');
        expect(err).to.be.null;
        done();
      });
  });

  it('should get dormant accounts if specified in the query string', (done) => {
    chai
      .request(server)
      .get('/api/v1/accounts/?status=dormant')
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data[0].status).to.equal('dormant');
        expect(err).to.be.null;
        done();
      });
  });

  it('should return an error if invalid query string is given', (done) => {
    chai
      .request(server)
      .get('/api/v1/accounts/?status=thisguy')
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Invalid query');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not get if client token does not belong to account owner', (done) => {
    chai
      .request(server)
      .get(`/api/v1/accounts/${activeAccount.id}`)
      .set('Authorization', `Bearer ${newToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body.error).to.equal('Token and user mismatch');
        done();
      });
  });

  it('should not get if account cannot be found', (done) => {
    chai
      .request(server)
      .get('/api/v1/accounts/1000000')
      .set('Authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal('Account not found');
        done();
      });
  });

  it('should not get if auth token is not provided', (done) => {
    chai
      .request(server)
      .get('/api/v1/accounts/1')
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body.error).to.equal('Auth token not provided');
        done();
      });
  });

  it('should return user if client requests with valid token', (done) => {
    chai
      .request(server)
      .get(`/api/v1/accounts/${newAccount.id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data[0]).to.have.all.keys(
          'owner',
          'account_number',
          'status',
          'account_type',
          'account_balance',
          'created_on',
          'id',
        );
        done();
      });
  });

  it('should return user if staff requests with valid token', (done) => {
    chai
      .request(server)
      .get(`/api/v1/accounts/${newAccount.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data[0]).to.have.all.keys(
          'owner',
          'account_number',
          'status',
          'account_type',
          'account_balance',
          'created_on',
          'id',
        );
        done();
      });
  });

  it('should return an array of all bank accounts if valid token is provided', (done) => {
    chai
      .request(server)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('array');
        done();
      });
  });
});

describe('PATCH accounts', () => {
  before(async () => {
    admin = await Users.create(adminUser);
    adminToken = generateToken({ id: admin.id });
    account = await Accounts.create({
      id: client.id,
      accountType: 'Savings',
      openingBalance: 10000,
      status: 'dormant',
      accountNumber: generateAccountNumber(),
      createdOn: new Date().toGMTString(),
    });
  });

  it('should return an error if account ID params is not given', (done) => {
    chai
      .request(server)
      .patch('/api/v1/accounts/')
      .send({ status: 'active' })
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal('Route /api/v1/accounts/ Not found.');
        done();
      });
  });

  it('should return error on entering invalid params', (done) => {
    chai
      .request(server)
      .patch('/api/v1/accounts/firstname')
      .send({ status: 'active' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res).to.not.include.key('data');
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal(
          'Provided id is invalid. Please provide a positive integer',
        );
        done();
      });
  });

  it('should return an error if status is not provided', (done) => {
    chai
      .request(server)
      .patch('/api/v1/accounts/1')
      .send({ name: 'active' })
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('status is required');
        done();
      });
  });

  it('should fail if client token is used to make request', (done) => {
    chai
      .request(server)
      .patch(`/api/v1/accounts/${account.id}`)
      .send({ status: 'active' })
      .set('authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not authorized');
        expect(err).to.be.null;
        done();
      });
  });

  it('should fail if non-admin staff token is used to make request', (done) => {
    chai
      .request(server)
      .patch(`/api/v1/accounts/${account.id}`)
      .send({ status: 'dormant' })
      .set('authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not authorized');
        expect(err).to.be.null;
        done();
      });
  });

  it('should activate account if valid admin token and account id are provided', (done) => {
    chai
      .request(server)
      .patch(`/api/v1/accounts/${account.id}`)
      .send({ status: 'active' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('data');
        expect(res.body.data[0]).to.include.key('status');
        expect(res.body.data[0].status).to.equal('active');
        expect(err).to.be.null;
        done();
      });
  });

  it('should deactivate account if valid admin token and account id are provided', (done) => {
    chai
      .request(server)
      .patch(`/api/v1/accounts/${account.id}`)
      .send({ status: 'dormant' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('data');
        expect(res.body.data[0]).to.include.key('status');
        expect(res.body.data[0].status).to.equal('dormant');
        expect(err).to.be.null;
        done();
      });
  });

  it('should fail if non-existent user is provided', (done) => {
    chai
      .request(server)
      .patch('/api/v1/accounts/10000000')
      .send({ status: 'dormant' })
      .set('authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account not found');
        expect(err).to.be.null;
        done();
      });
  });
});

describe('DELETE Account', () => {
  before(async () => {
    account2 = await Accounts.create({
      id: client.id,
      accountType: 'Current',
      openingBalance: 10000000,
      status: 'draft',
      accountNumber: generateAccountNumber(),
      createdOn: new Date().toGMTString(),
    });
  });
  it('should return an error if account ID params is not given', (done) => {
    chai
      .request(server)
      .delete('/api/v1/accounts/')
      .send()
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal('Route /api/v1/accounts/ Not found.');
        done();
      });
  });

  it('should delete account if valid staff token is provided', (done) => {
    let deletedAccount;
    chai
      .request(server)
      .delete(`/api/v1/accounts/${account.id}`)
      .send()
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        Accounts.findOne(account.id).then((item) => {
          deletedAccount = item;
        });
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal('Account successfully deleted');
        expect(err).to.be.null;
        expect(deletedAccount).to.be.undefined;
        done();
      });
  });

  it('should delete account if valid admin token is provided', (done) => {
    let deletedAccount;
    const token = generateToken({ id: 1 });
    chai
      .request(server)
      .delete(`/api/v1/accounts/${account2.id}`)
      .send()
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        Accounts.findOne(account2.id).then((item) => {
          deletedAccount = item;
        });
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal('Account successfully deleted');
        expect(err).to.be.null;
        expect(deletedAccount).to.be.undefined;
        done();
      });
  });

  it('should return error if client token is provided', (done) => {
    chai
      .request(server)
      .delete(`/api/v1/accounts/${account.id}`)
      .send()
      .set('Authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not authorized');
        expect(err).to.be.null;
        done();
      });
  });

  it('should return error if non existent user is provided', (done) => {
    chai
      .request(server)
      .delete('/api/v1/accounts/10000000')
      .send()
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account not found');
        expect(err).to.be.null;
        done();
      });
  });
});
