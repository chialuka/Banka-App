/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import normalUser, {
  wrongEmailDetail, existingEmailDetail, loginUserDetails, createUser,
} from '../fixtures';
import models from '../models';

chai.use(chaiHttp);

const { expect } = chai;

const { Users } = models;


describe('POST User', () => {
  // should create user succesfully(201)
  it('should create a user successfully', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(createUser)
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
  it('should not create a user if email is invalid', (done) => {
    chai
      .request(server)
      .post('/api/users/auth/signup')
      .send(wrongEmailDetail)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('"email" must be a valid email');
        done();
      });
  });

  // should fail with server error(500)

  // should not create user with email that exists(409)
  it('should not create a user if email already exists', (done) => {
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

describe('GET/ User', () => {
  // should return user with specified id or email
  it('should return specified user', (done) => {
    Users.create({ ...normalUser }).then((newUser) => {
      chai
        .request(server)
        .get(`/api/users/${newUser.id}`)
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.key('user');
          expect(res.body.user).to.be.an('object');
          expect(res.body.user).to.include.key('email');
          expect(res.body.user).to.include.key('firstname');
          expect(res.body.user).to.include.key('lastname');
          expect(err).to.be.null;
          done();
        });
    });
  });

  // should fail to return when wrong details are passed
  it('should not return user on entering wrong credentials', (done) => {
    chai
      .request(server)
      .get(`/api/users/${normalUser.firstname}`)
      .send(normalUser)
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res).to.not.include.key('data');
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not found');
        done();
      });
  });
});

describe('PUT/ User', () => {
  // should test for updating user's names
  it('should update user\'s names.', (done) => {
    Users.create({ ...normalUser }).then((newUser) => {
      chai
        .request(server)
        .put(`/api/users/${newUser.id}`)
        .send({ firstname: 'Rihanna', lastname: 'Okonkwo' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('data');
          expect(res.body.data.firstname).to.equal('Rihanna');
          expect(res.body.data.lastname).to.equal('Okonkwo');
          expect(err).to.be.null;
          done();
        });
    });
  });

  // should test to ensure user email cannot be updated
  it('should not update user email', (done) => {
    Users.create({ ...normalUser }).then((newUser) => {
      chai
        .request(server)
        .put(`/api/users/${newUser.id}`)
        .send({ lastname: 'Udara', email: 'otakagu.dikagu@gmail.com' })
        .end((err, res) => {
          expect(res.body.data.firstname).to.equal(newUser.firstname);
          expect(res.body.data.lastname).to.equal('Udara');
          expect(res.body.data.email).to.equal(newUser.email);
          expect(err).to.be.null;
          done();
        });
    });
  });
});

describe('DELETE/ User', () => {
  // should test to see that user is successfully deleted
  it('should delete user', (done) => {
    Users.create({ ...normalUser }).then((newUser) => {
      chai
        .request(server)
        .delete(`/api/users/${newUser.id}`)
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.key('message');
          expect(err).to.be.null;
          done();
        });
    });
  });
});
