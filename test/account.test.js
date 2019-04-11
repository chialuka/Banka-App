/* eslint-disable no-shadow */
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
  clientAccount,
  staffUser,
  adminAccount,
  staffToken,
  clientToken,
  adminAccount2,
} from '../fixtures';

chai.use(chaiHttp);

const { Accounts, Users } = models;

const { expect } = chai;

let clientAccountToken;
let staffAccountToken;
let adminAccountToken;

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
      .send(clientAccount)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        clientAccountToken = res.body.data.token;
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
            .set('authorization', `Bearer ${clientAccountToken}`)
            .end((err, res) => {
              expect(res).to.have.status(201);
              expect(res.body).to.include.key('data');
              expect(res.body.data).to.include.key('accountNumber');
              expect(res.body.data).to.include.key('openingBalance');
              expect(res.body.data).to.include.key('accountType');
              expect(res.body.data).to.include.key('status');
              expect(res.body.data).to.include.key('owner');
              expect(res.body.data).to.include.key('createdOn');
              expect(err).to.be.null;
              done();
            });
        });
      });
  });

  it('should not create account if token provided is not for client', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(staffUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        staffAccountToken = res.body.data.token;
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
            .set('authorization', `Bearer ${staffAccountToken}`)
            .end((err, res) => {
              expect(res).to.have.status(403);
              expect(res.body).to.include.key('error');
              expect(res.body.error).to.equal('User not authorized');
              expect(err).to.be.null;
              done();
            });
        });
      });
  });
});

describe('PATCH accounts', () => {
  it('should return an error if account ID params is not given', (done) => {
    chai
      .request(server)
      .patch('/api/accounts/')
      .send({ status: 'active' })
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal('Route /api/accounts/ Not found.');
        done();
      });
  });

  it('should return an error if status is not provided', (done) => {
    chai
      .request(server)
      .patch('/api/accounts/1')
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
    Accounts.findAll().then((accounts) => {
      const account = accounts[1];
      chai
        .request(server)
        .patch(`/api/accounts/${account.id}`)
        .send({ status: 'active' })
        .set('authorization', `Bearer ${clientAccountToken}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.include.key('error');
          expect(res.body.error).to.equal('User not authorized');
          expect(err).to.be.null;
          done();
        });
    });
  });

  it('should fail if non-admin staff token is used to make request', (done) => {
    Accounts.findAll().then((accounts) => {
      const account = accounts[1];
      chai
        .request(server)
        .patch(`/api/accounts/${account.id}`)
        .send({ status: 'dormant' })
        .set('authorization', `Bearer ${staffAccountToken}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.include.key('error');
          expect(res.body.error).to.equal('User not authorized');
          expect(err).to.be.null;
          done();
        });
    });
  });

  it('should fail if wrong account id is provided', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(adminAccount2)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        const { token } = res.body.data;
        Accounts.findAll().then((accounts) => {
          const account = accounts[1];
          chai
            .request(server)
            .patch(`/api/accounts/${account.id}`)
            .send({ status: 'active' })
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
              expect(res).to.have.status(404);
              expect(res.body).to.include.key('error');
              expect(res.body.error).to.equal('Account owner not found');
              expect(err).to.be.null;
              done();
            });
        });
      });
  });

  it('should create account if valid admin token and account id are provided', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(adminAccount)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        adminAccountToken = res.body.data.token;
        Accounts.findAll().then((accounts) => {
          const account = accounts[accounts.length - 1];
          chai
            .request(server)
            .patch(`/api/accounts/${account.id}`)
            .send({ status: 'active' })
            .set('authorization', `Bearer ${adminAccountToken}`)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.include.key('data');
              expect(res.body.data).to.include.key('status');
              expect(res.body.data.status).to.equal('active');
              expect(err).to.be.null;
              done();
            });
        });
      });
  });

  it('should fail if non-existent user is provided', (done) => {
    chai
      .request(server)
      .patch('/api/accounts/10000000')
      .send({ status: 'dormant' })
      .set('authorization', `Bearer ${adminAccountToken}`)
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
  it('should return an error if account ID params is not given', (done) => {
    chai
      .request(server)
      .delete('/api/accounts/')
      .send()
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal('Route /api/accounts/ Not found.');
        done();
      });
  });

  it('should delete account if valid staff token is provided', (done) => {
    let deletedAccount;
    Accounts.findAll().then((accounts) => {
      const account = accounts[accounts.length - 1];
      chai
        .request(server)
        .delete(`/api/accounts/${account.id}`)
        .send()
        .set('Authorization', `Bearer ${staffAccountToken}`)
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
  });

  it('should delete account if valid admin token is provided', (done) => {
    let deletedAccount;
    Accounts.findAll().then((accounts) => {
      const account = accounts[accounts.length - 1];
      chai
        .request(server)
        .delete(`/api/accounts/${account.id}`)
        .send()
        .set('Authorization', `Bearer ${adminAccountToken}`)
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
  });

  it('should return error if client token is provided', (done) => {
    Accounts.findAll().then((accounts) => {
      const account = accounts[1];
      chai
        .request(server)
        .delete(`/api/accounts/${account.id}`)
        .send()
        .set('Authorization', `Bearer ${clientAccountToken}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.include.key('error');
          expect(res.body.error).to.equal('User not authorized');
          expect(err).to.be.null;
          done();
        });
    });
  });

  it('should return error if non existent user is provided', (done) => {
    chai
      .request(server)
      .delete('/api/accounts/10000000')
      .send()
      .set('Authorization', `Bearer ${staffAccountToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Account not found');
        expect(err).to.be.null;
        done();
      });
  });
});
