/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import dotenv from 'dotenv';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import server from '../index';
import {
  clientUser,
  correctPasswordClient,
  staffUser,
  adminUser
} from '../fixtures';
import * as Users from '../models/users';
import { generateToken } from '../utils';

dotenv.config();

const { USER_NAME, PASSWORD } = process.env;

chai.use(chaiHttp);

let createdStaff;

describe('GET / route', () => {
  it('should get / route', (done) => {
    chai
      .request(server)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        done();
      });
  });

  it('should get /api-docs route', (done) => {
    chai
      .request(server)
      .get('/api-docs')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        done();
      });
  });
});

describe('POST User', () => {
  before((done) => {
    Users.deleteAll().then(res => res);
    done();
  });

  it('should create a user successfully', (done) => {
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send({
        firstname: 'Odogwu',
        lastname: 'Malaysia',
        email: 'odogwuone@gmail.com',
        password: 'odogwuodogwu'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.key('data');
        expect(res.body.data['0']).to.include.key('email');
        expect(res.body.data['0']).to.include.key('first_name');
        expect(res.body.data['0']).to.include.key('last_name');
        expect(res.body.data['0']).to.include.key('token');
        expect(res.body.data['0']).to.not.include.key('password');
        expect(err).to.be.null;
        done();
      });
  });

  it('should log super admin in', (done) => {
    chai
      .request(server)
      .post('/api/v1/users/auth/signin')
      .send({
        email: `${USER_NAME}`,
        password: `${PASSWORD}`
      })
      .end((_, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data[0]).to.include.key('token');
        done();
      });
  });

  it('should allow super admin create other admin', (done) => {
    const adminToken = generateToken({ id: 1 });
    chai
      .request(server)
      .post('/api/v1/staff/auth/signup')
      .send(adminUser)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data[0]).to.include.key('token');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not create a user if email is invalid', (done) => {
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send({
        clientUser,
        email: 'howareyou'
      })
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.include.key('errors');
        expect(res.body.errors)
          .to.be.an('array')
          .that.includes('firstname is required');
        done();
      });
  });

  it('should not create a client who is an admin', (done) => {
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send({
        ...clientUser,
        email: 'testmic@testmic.com',
        isAdmin: true
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors).to.include('isAdmin is not allowed');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not create a user if email already exists', (done) => {
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send({
        ...clientUser,
        email: `${USER_NAME}`
      })
      .end((_, res) => {
        expect(res).to.have.status(409);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.include(
          'User with provided email already exists'
        );
        done();
      });
  });

  it('should not log user with wrong password in', (done) => {
    Users.create(staffUser).then((user) => {
      createdStaff = user;
      chai
        .request(server)
        .post('/api/v1/users/auth/signin')
        .send({
          email: createdStaff.email,
          password: createdStaff.password
        })
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
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send(correctPasswordClient)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.data['0']).to.include.key('token');
        expect(err).to.be.null;
        chai
          .request(server)
          .post('/api/v1/users/auth/signin')
          .send({
            email: correctPasswordClient.email,
            password: correctPasswordClient.password
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.include.key('data');
            expect(res.body.data['0']).to.include.key('token');
            expect(err).to.be.null;
            done();
          });
      });
  });

  it('should not login user who is not registered', (done) => {
    chai
      .request(server)
      .post('/api/v1/users/auth/signin')
      .send({
        password: clientUser.password,
        email: 'nkeonyemetalumbu@gmail.com'
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body).to.not.include.key('token');
        done();
      });
  });

  it("should return a user's accounts", (done) => {
    const token = generateToken({ id: createdStaff.id });
    chai
      .request(server)
      .get(`/api/v1/users/accounts/${createdStaff.id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('array');
        expect(err).to.be.null;
        done();
      });
  });
});

describe('GET/ User', () => {
  let getstaffUser;
  let getStaffToken;
  before(async () => {
    await Users.deleteAll();
    getstaffUser = await Users.create(staffUser);
    getStaffToken = generateToken({ id: getstaffUser.id });
  });

  it('should return specified user', (done) => {
    chai
      .request(server)
      .get(`/api/v1/users/${getstaffUser.id}`)
      .set('Authorization', `Bearer ${getStaffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.key('data');
        expect(res.body.data[0]).to.be.an('object');
        expect(res.body.data[0]).to.include.key('email');
        expect(res.body.data[0]).to.include.key('first_name');
        expect(res.body.data[0]).to.include.key('last_name');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not return user on entering invalid params', (done) => {
    chai
      .request(server)
      .get('/api/v1/users/firstname')
      .set('Authorization', `Bearer ${getStaffToken}`)
      .end((_, res) => {
        expect(res).to.have.status(400);
        expect(res).to.not.include.key('data');
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal(
          'Provided id is invalid. Please provide a positive integer'
        );
        done();
      });
  });

  it('should not return empty array if there are users registered', (done) => {
    chai
      .request(server)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${getStaffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.key('data');
        expect(res.body.data).to.be.an('array');
        expect(res.body.data).to.have.length.above(0);
        done();
      });
  });

  it('should return an error if requested user cannot be found', (done) => {
    chai
      .request(server)
      .get('/api/v1/users/1000000')
      .set('Authorization', `Bearer ${getStaffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not found');
        expect(err).to.be.null;
        done();
      });
  });

  it('should return an error if no user making request cannot be found', async () => {
    await Users.deleteAll();
    chai
      .request(server)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${getStaffToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User with provided token not found');
        expect(err).to.be.null;
      });
  });
});

describe('PUT/ User', () => {
  let client;
  let staff;
  let token;
  before(async () => {
    await Users.deleteAll();
    client = await Users.create(correctPasswordClient);
    staff = await Users.create(staffUser);
    token = generateToken({ id: client.id });
  });

  it("should update user's details", (done) => {
    chai
      .request(server)
      .put(`/api/v1/users/${client.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Rihanna',
        lastname: 'Okonkwo',
        password: 'mangohead',
        email: 'testingthisemail@testing.com'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.key('data');
        expect(res.body.data[0].first_name).to.equal('Rihanna');
        expect(res.body.data[0].last_name).to.equal('Okonkwo');
        expect(res.body.data[0].email).to.equal('testingthisemail@testing.com');
        expect(err).to.be.null;
        done();
      });
  });

  it("should not reset user's password if email cannot be found", (done) => {
    chai
      .request(server)
      .post('/api/v1/users/resetpassword')
      .send({
        email: 'testingthatemail@testing.com'
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not found');
        expect(err).to.be.null;
        done();
      });
  });

  it("should reset user's password", (done) => {
    chai
      .request(server)
      .post('/api/v1/users/resetpassword')
      .send({
        email: 'testingthisemail@testing.com'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal('Otp sent');
        expect(err).to.be.null;
        done();
      });
  });

  it('should not update user if it cannot find user', (done) => {
    chai
      .request(server)
      .put('/api/v1/users/10000000')
      .set('Authorization', `Bearer ${token}`)
      .send({
        lastname: 'Udara',
        email: 'otakagu.dikagu@gmail.com'
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('Cannot find user');
        expect(err).to.be.null;
        done();
      });
  });
});

describe('DELETE/ User', () => {
  let token;
  let staff;
  before(async () => {
    await Users.deleteAll();
    staff = await Users.create(staffUser);
    token = generateToken({ id: staff.id });
  });

  it('should return error for deleting non-existent user', (done) => {
    chai
      .request(server)
      .delete('/api/v1/users/10000000')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User not found');
        expect(err).to.be.null;
        done();
      });
  });

  it('should delete user', (done) => {
    chai
      .request(server)
      .delete(`/api/v1/users/${staff.id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.key('message');
        expect(res.body.message).to.equal(
          `User with ID ${staff.id} deleted successfully`
        );
        expect(err).to.be.null;
        done();
      });
  });

  it('should return an error if token owner does not exist', (done) => {
    chai
      .request(server)
      .delete(`/api/v1/users/${staff.id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('User with provided token not found');
        expect(err).to.be.null;
        done();
      });
  });
});

describe('500 error', () => {
  let client;
  let staff;
  let token;
  let clientToken;
  before(async () => {
    await Users.deleteAll();
    client = await Users.create(clientUser);
    clientToken = generateToken({ id: client.id });
    staff = await Users.create(staffUser);
    token = generateToken({ id: staff.id });
  });

  it('should throw if it encounters an error on create', (done) => {
    const stub = sinon.stub(Users, 'create');
    const error = new Error('A fix is in progress');
    stub.yields(error);
    chai
      .request(server)
      .post('/api/v1/users/auth/signup')
      .send(correctPasswordClient)
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('A fix is in progress');
        done();
      });
  });

  it('should throw if it encounters an error on update', (done) => {
    const stub = sinon.stub(Users, 'findOneAndUpdate');
    const error = new Error('A fix is in progress');
    stub.yields(error);
    chai
      .request(server)
      .put(`/api/v1/users/${client.id}`)
      .send({
        firstname: 'Okwegba'
      })
      .set('authorization', `Bearer ${clientToken}`)
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('A fix is in progress');
        done();
      });
  });

  it('should throw if it encounters an error on delete', (done) => {
    const stub = sinon.stub(Users, 'findOneAndDelete');
    const error = new Error('A fix is in progress');
    stub.yields(error);
    chai
      .request(server)
      .delete(`/api/v1/users/${staff.id}`)
      .set('authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.include.key('error');
        expect(res.body.error).to.equal('A fix is in progress');
        done();
      });
  });

  it('should throw if it encounters an error on OTP', (done) => {
    const stub = sinon.stub(Users, 'findOTP');
    const error = new Error('A fix is in progress');
    stub.yields(error);
    chai
      .request(server)
      .post('/api/v1/users/changepassword')
      .send({
        password: 'monkey',
        otp: 12345678
      })
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.include.key('error');
        done();
      });
  });
});
