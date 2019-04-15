import '@babel/polyfill';
import chai, { Expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';
import {} from '../utils';
import models from '../models';

chai.use(chaiHttp);

const { Accounts, Users } = models;

describe('POST transfers', () => {
  
})