/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import normalUser, {
  wrongEmailDetail, existingEmailDetail, deleteUser, loginUserDetails,
} from '../fixtures';
import models from '../models';

chai.use(chaiHttp);

const { expect } = chai;

const { Users } = models;


describe('POST User', () => {
  // should create user succesffully(201)
  xit('should create a user successfully', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(normalUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.key('data');
        expect(res.body.data).to.include.key('email');
        expect(res.body.data).to.include.key('firstname');
        expect(res.body.data).to.include.key('lastname');
        expect(res.body.data).to.include.key('token');
        expect(res.body.data).to.not.include.key('password');
        expect(err).to.be.null;
        done();
      });
  });
  // should not create user if req body is invalid(400)
  xit('should not create a user if email is invalid', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(wrongEmailDetail)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('\"email\" must be a valid email');
        done();
      });
  });

  // should fail with server error(500)

  // should not create user with email that exists(409)
  xit('should not create a user if email already exists', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(existingEmailDetail)
      .end((_, res) => {
        expect(res).to.have.status(409);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.include(
          'User with provided email already exists',
        );
        done();
      });
  });
});

// should create token for user with correct credentials
it('should create token for user to log in', (done) => {
  chai
    .request(server)
    .post('/api/users/auth/signin')
    .send(loginUserDetails)
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.include.key('data');
      expect(res.body.data).to.include.key('email');
      expect(res.body.data).to.include.key('token');
      expect(res.body.data).to.not.include.key('password');
      expect(err).to.be.null;
      done();
    });
});

// should not login user with wrong details
it('should not login user with wrong details', (done) => {
  Users.create({ ...normalUser }).then((newUser) => {
    chai
      .request(server)
      .post('/api/users/auth/signin')
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.include.key('error');
        expect(res.body).to.not.include.key('token');
        done();
      });
  });
});

describe('GET/ User', () => {});

describe('PUT/ User', () => {});

describe('DELETE/ User', () => {
  // should test to see that user is successfully deleted

  it('should delete user', (done) => {
    Users.create({ ...normalUser }).then((newUser) => {
      chai
        .request(server)
        .delete(`/api/users/${newUser.id}`)
        .send(deleteUser)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.key('message');
          expect(err).to.be.null;
          done();
        });
    });
  });
});
