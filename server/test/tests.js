/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
import '@babel/polyfill';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import normalUser, {
  wrongEmailDetail, existingEmailDetail, loginUserDetails,
} from '../fixtures';

chai.use(chaiHttp);

const { expect } = chai;


describe('POST User', () => {
  // should create user succesffully(201)
  it('should create a user successfully', (done) => {
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
          .that.includes('\"email\" must be a valid email');
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

describe('GET/ User', () => {});

describe('PUT/ User', () => {});

describe('DELETE/ User', () => {});
