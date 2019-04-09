/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import models from '../models';
import {
  accountUser,
  noEmailAccount,
  noBalanceAccount,
  noTypeAccount,
  stringOpeningBalance,
  invalidAccountType,
  validAccount,
} from '../fixtures';

chai.use(chaiHttp);

const { Accounts, Users } = models;

const { expect } = chai;

// let user;
// let token;

describe('POST accounts', () => {
  // before((done) => {

  // });
  it('should not create an account without authenticating login', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send(accountUser)
      .end((_, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Auth token not provided');
        done();
      });
  });

  it('should return an error if email is omitted', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send(noEmailAccount)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"email" is required');
        done();
      });
  });

  it('should return an error if account type is omitted', (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
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
      .post('/api/accounts/')
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
      .post('/api/accounts/')
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
      .post('/api/accounts/')
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

  it('should create an account if valid details are provided', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(validAccount)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        const { token } = res.body.data;
        Users.findAll().then((users) => {
          const user = users[users.length - 1];
          chai
            .request(server)
            .post('/api/accounts/')
            .send({
              email: user.email,
              accountType: user.accountType,
              openingBalance: user.openingBalance,
            })
            .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTYsImlhdCI6MTU1NDg1Mzg2MSwiZXhwIjoxNTU0ODU3NDYxfQ.3-bqQc4-vbqYml09rE7n_RJl_8JH4C9qe1YinZqgBug')
            .end((err, res) => {
              expect(res).to.have.status(201);
              expect(res.body).to.include.key('data');
              expect(res.body.data).to.include.key('accountNumber');
              expect(res.body.data).to.include.key('openingBalance');
              expect(res.body.data).to.include.key('accountType');
              expect(err).to.be.null;
              done();
            });
        });
      });
  });
});
