/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import models from '../models';
import normalUser, {} from '../fixtures';

chai.use(chaiHttp);

const { Accounts, Users } = models;

const { expect } = chai;

describe(
  'should create account for user that is registered and logged in',
  (done) => {
    chai
      .request(server)
      .post('/api/accounts/')
      .send(normalUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.key('data');
        expect(res.body.data).to.include('accountNumber')
          .that.is.an('integer');
        expect(err).to.be.null;
        done();
      });
  },
);
