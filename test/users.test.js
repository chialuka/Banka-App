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
  adminAccount,
} from '../fixtures';
import models from '../models';
import { generateToken } from '../utils';

chai.use(chaiHttp);

const { Users } = models;

let createdClient;
let createdStaff;
let clientToken;
let clientId;

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
  let getStaffUser;
  let getStaffToken;
  before(async () => {
    getStaffUser = await Users.create(getUserStaff);
    getStaffToken = generateToken({ id: getStaffUser.id });
  });
  // should return user with specified id or email
  it('should return specified user', (done) => {
    Users.findAll().then((users) => {
      const [user, ...rest] = users.slice(-1);
      chai
        .request(server)
        .get(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${getStaffToken}`)
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

  // should fail to return when wrong details are passed
  it('should not return user on entering wrong params', (done) => {
    chai
      .request(server)
      .get(`/api/v1/users/${createdClient.firstname}`)
      .set('Authorization', `Bearer ${getStaffToken}`)
      .send()
      .end((_, res) => {
        expect(res).to.have.status(404);
        expect(res).to.not.include.key('data');
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not found');
        done();
      });
  });

  // return non empty array if there are users registered
  it('should not return empty array if there are users registered', (done) => {
    chai
      .request(server)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${getStaffToken}`)
      .send()
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.key('data');
        expect(res.body.data).to.be.an('array');
        expect(res.body.data).to.have.length.above(0);
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
      .send({
        ...correctPasswordClient,
        firstname: 'Rihanna',
        lastname: 'Okonkwo',
      })
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
      .send({
        ...correctPasswordClient,
        lastname: 'Udara',
        email: 'otakagu.dikagu@gmail.com',
      })
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
  let staffDeleteAccount;
  let deleteToken;
  let clientDeleteAccount;
  before(async () => {
    clientDeleteAccount = await Users.create(clientUser);
    staffDeleteAccount = await Users.create(staffUser);
    deleteToken = generateToken({ id: staffDeleteAccount.id });
  });
  // should test to see that user is successfully deleted
  it('should delete user', (done) => {
    chai
      .request(server)
      .delete(`/api/v1/users/${clientDeleteAccount.id}`)
      .set('Authorization', `Bearer ${deleteToken}`)
      .send()
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('message');
        expect(err).to.be.null;
        done();
      });
  });

  // test to ensure error is returned when trying to delete non existent user
  it('should return error for deleting non-existent user', (done) => {
    chai
      .request(server)
      .delete('/api/v1/users/10000000000')
      .set('Authorization', `Bearer ${deleteToken}`)
      .send()
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not found');
        expect(err).to.be.null;
        done();
      });
  });
});