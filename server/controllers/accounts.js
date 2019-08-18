import * as Accounts from '../models/accounts';
import * as Users from '../models/users';
import { setServerResponse, generateAccountNumber } from '../utils';
import * as Mailer from './mailer';

/**
 * ensure user exists, create account and call function to send email to user
 * @name createAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} JSON Object with data of the newly created account
 * or the error that was encountered while trying to create it
 */
const createAccount = async (req, res) => {
  try {
    const { tokenOwner } = res.locals;
    const { id } = tokenOwner;
    const user = await Users.findOneById(id);
    const accountNumber = Number(generateAccountNumber());
    const createdOn = new Date().toGMTString();
    const accObj = {
      accountNumber, createdOn, status: 'dormant', id, ...req.body,
    };
    const newAccount = await Accounts.create(accObj);
    Mailer.sendNewAccountMail(user, accObj);
    return setServerResponse(res, 201, { data: [{ ...newAccount }] });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};


/**
 * Activate or deactivate client account
 * then call function to send relevant email to the client
 * @name patchAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} JSON Object with either details of the updated account
 * or the error encountered while making the request
 */
const patchAccount = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.params.id);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const user = await Users.findOneById(account.owner);
    if (!user) {
      return setServerResponse(res, 404, { error: 'Account owner not found' });
    }
    const { status } = req.body;
    const data = { status, id: account.id };
    const patchedUser = await Accounts.findOneAndUpdate(data);
    if (status === 'dormant') {
      Mailer.sendDeactivationMail(user.email, account);
    }
    Mailer.sendActivationMail(user.email, account);
    return setServerResponse(res, 200, { data: [{ ...patchedUser }] });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};


/**
 * Delete account on provision of a valid account ID
 * @name deleteAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} JSON Object informing user whether delete
 * was successful or not
 */
const deleteAccount = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.params.id);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    await Accounts.findOneAndDelete(req.params.id);
    Mailer.sendDeleteAccountMail(account);
    return setServerResponse(res, 200, {
      message: 'Account successfully deleted'
    });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * Get details of an individual account on providing a valid account id
 * @name getAccountDetails
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON} details of the account requested or the error that
 * prevented the GET
 */
const getAccountDetails = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.params.id);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const { tokenOwner } = res.locals;
    if (!tokenOwner.is_staff && tokenOwner.id !== account.owner) {
      return setServerResponse(res, 403, { error: 'Token and user mismatch' });
    }
    return setServerResponse(res, 200, { data: [account] });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * Get accounts with the status given in the request query string
 * @name getQueryString
 * @async
 * @param {Object} queryString
 * @param {Object} res
 * @returns {JSON} accounts sorted by the provided condition in the query
 */
const getQueryString = async (queryString, res) => {
  try {
    const { status } = queryString;
    const validQueries = ['active', 'dormant'];
    if (!status || !validQueries.includes(status)) {
      return setServerResponse(res, 400, { error: 'Invalid query' });
    }
    const accounts = await Accounts.findByStatus(status);
    return setServerResponse(res, 200, { data: accounts });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * Get all accounts in the database
 * @name getAllAccounts
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON} array containing all accounts
 */
const getAllAccounts = async (req, res) => {
  try {
    if (Object.keys(req.query).length) {
      getQueryString(req.query, res);
      return null;
    }
    const accounts = await Accounts.findAll();
    return setServerResponse(res, 200, { data: accounts });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * Get all transactions performed on an account
 * @name getAccountTransactions
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON} details of transactions perfomed on any account
 */
const getAccountTransactions = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.params.id);
    const number = account.account_number;
    const transactions = await Accounts.findByTransaction(number);
    return setServerResponse(res, 200, { data: transactions });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

export {
  createAccount,
  patchAccount,
  deleteAccount,
  getAccountDetails,
  getAllAccounts,
  getAccountTransactions
};
