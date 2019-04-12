/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import {
  wrongEmailDetail,
  clientUser,
  wrongTypeUser,
  getUserStaff,
  correctPasswordClient,
  staffUser,
  correctClient,
} from '../fixtures';
import models from '../models';

chai.use(chaiHttp);

const { Users } = models;

let createdClient;
let createdStaff;
let clientToken;
let clientId;
let clientFirstname;
let clientEmail;
let staffToken;

describe('POST User', () => {
  // should create user succesfully(201)
  it('should create a user successfully', (done) => {
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send(clientUser)
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
      .post('/api/v1/users/auth/signup')
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
      .post('/api/v1/users/auth/signup')
      .send(clientUser)
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
it('should not log user with wrong password in', (done) => {
  Users.create(staffUser).then((user) => {
    createdStaff = user;
    chai
      .request(server)
      .post('/api/v1/users/auth/signin')
      .send(createdStaff)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Incorrect password');
        expect(err).to.be.null;
        done();
      });
  });
});

it('should log in registered user with correct email and password', (done) => {
  Users.create(correctClient).then((user) => {
    createdClient = user;
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send(correctPasswordClient)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data).to.include.key('token');
        expect(err).to.be.null;
        clientToken = res.body.data.token;
        clientId = res.body.data.id;
        clientFirstname = res.body.data.firstname;
        clientEmail = res.body.data.email;
        chai
          .request(server)
          .post('/api/v1/users/auth/signin')
          .send(correctPasswordClient)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.include.key('data');
            expect(res.body.data).to.include.key('token');
            expect(err).to.be.null;
            done();
          });
      });
  });
});

// should not login user with wrong details
it('should not login user who is not registered', (done) => {
  chai
    .request(server)
    .post('/api/v1/users/auth/signin')
    .send(wrongTypeUser)
    .end((err, res) => {
      expect(res).to.have.status(404);
      expect(res.body).to.include.key('error');
      expect(res.body).to.not.include.key('token');
      done();
    });
});

describe('GET/ User', () => {
  // should return user with specified id or email
  it('should return specified user', (done) => {
    Users.findAll().then((users) => {
      const [user, ...rest] = users.slice(-1);
      chai
        .request(server)
        .post('/api/v1/users/auth/signup')
        .send(getUserStaff)
        .end((_, res) => {
          expect(res).to.have.status(201);
          expect(res.body.data).to.include.key('token');
          staffToken = res.body.data.token;
          chai
            .request(server)
            .get(`/api/v1/users/${user.id}`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send()
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.a('object');
              expect(res.body).to.include.key('data');
              expect(res.body.data).to.be.an('object');
              expect(res.body.data).to.include.key('email');
              expect(res.body.data).to.include.key('firstname');
              expect(res.body.data).to.include.key('lastname');
              expect(err).to.be.null;
              done();
            });
        });
    });
  });

  // should fail to return when wrong details are passed
  it('should not return user on entering wrong params', (done) => {
    chai
      .request(server)
      .get(`/api/v1/users/${createdClient.firstname}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send()
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
  it("should update user's names", (done) => {
    chai
      .request(server)
      .put(`/api/v1/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ ...correctPasswordClient, firstname: 'Rihanna', lastname: 'Okonkwo' })
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

  // should test to ensure user email cannot be updated
  it('should not update user email', (done) => {
    chai
      .request(server)
      .put(`/api/v1/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ ...correctPasswordClient, lastname: 'Udara', email: 'otakagu.dikagu@gmail.com' })
      .end((err, res) => {
        expect(res).to.have.status(403);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Cannot update email');
        expect(err).to.be.null;
        done();
      });
  });
});

describe('DELETE/ User', () => {
  // should test to see that user is successfully deleted
  it('should delete user', (done) => {
    chai
      .request(server)
      .delete(`/api/v1/users/${createdClient.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send()
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('message');
        expect(err).to.be.null;
        done();
      });
  });
});
