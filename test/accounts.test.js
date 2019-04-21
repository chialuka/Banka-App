/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
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
let staff;

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

  it('should return an error if od is omitted', (done) => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send(noIdAccount)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"id" is required');
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
          .that.includes('"accountType" is required');
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
          .that.includes('"openingBalance" is required');
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
          .that.includes('"openingBalance" must be a number');
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
          .that.includes('"accountType" must be one of [savings, current]');
        done();
      });
  });

  it('should create an account if valid details are provided', async () => {
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send({
        id: client.id,
        accountType: 'current',
        openingBalance: 10000,
      })
      .set('authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.include.key('data');
        expect(res.body.data[0]).to.include.key('account_number');
        expect(res.body.data[0]).to.include.key('account_balance');
        expect(res.body.data[0]).to.include.key('account_type');
        expect(res.body.data[0]).to.include.key('status');
        expect(res.body.data[0]).to.include.key('owner');
        expect(res.body.data[0]).to.include.key('created_on');
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
        id: 100000000,
      })
      .set('authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account owner not found');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not create account if token does not belong to user with request if', async () => {
    const newUser = await Users.create(correctPasswordClient);
    const newToken = generateToken({ id: newUser.id });
    chai
      .request(server)
      .post('/api/v1/accounts/')
      .send({
        ...accountUser,
        id: client.id,
      })
      .set('authorization', `Bearer ${newToken}`)
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Token and user mismatch');
        expect(err).to.be.null;
      });
  });
});

describe('PATCH accounts', () => {
  let admin;
  let adminToken;
  let account;
  before(async () => {
    admin = await Users.create(adminUser);
    adminToken = generateToken({ id: admin.id });
    account = await Accounts.create({
      id: client.id,
      accountType: 'savings',
      openingBalance: 10000,
      status: 'dormant',
      accountNumber: generateAccountNumber(),
      createdOn: (new Date()).toGMTString(),
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
          .that.includes('"status" is required');
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

xdescribe('DELETE Account', () => {
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
    const [account, ...rest] = allAccounts.slice(-1);
    chai
      .request(server)
      .delete(`/api/v1/accounts/${account.id}`)
      .send()
      .set('Authorization', `Bearer ${staffToken}`)
      .end((err, res) => {
        Accounts.findOne('id', Number(account.id)).then((item) => {
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
    const [account, ...rest] = allAccounts;
    chai
      .request(server)
      .delete(`/api/v1/accounts/${account.id}`)
      .send()
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        Accounts.findOne('id', Number(account.id)).then((item) => {
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
    const [account, ...rest] = allAccounts;
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
