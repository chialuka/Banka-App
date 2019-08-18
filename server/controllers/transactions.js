import * as Transactions from '../models/transactions';
import * as Accounts from '../models/accounts';
import * as Users from '../models/users';
import * as Mailer from './mailer';
import { setServerResponse } from '../utils';

/**
 * Post transaction to the database with transaction details
 * @name postTransaction
 * @async
 * @param {Object} postingDetails
 * @returns {JSON} array containing details of the newly created account
 */
const postTransaction = async (postingDetails) => {
  const {
    res, transactionData, oldBalance, reqBody, account
  } = postingDetails;
  const user = await Users.findOneById(account.owner);
  if (!user) {
    return setServerResponse(res, 404, { error: 'Account owner not found' });
  }
  const newTransaction = await Transactions.create({
    ...transactionData,
    oldBalance
  });
  Mailer.sendTransactionEmail(user.email, user.first_name, transactionData);
  if (reqBody.senderAccount || reqBody.receiverAccount || reqBody.phoneNumber) {
    return null;
  }
  return setServerResponse(res, 201, { data: [{ ...newTransaction }] });
};

/**
 * Charge the account of the provided client with the specified amount and save
 * @name chargeAccount
 * @async
 * @param {Object} res
 * @param {Object} account
 * @param {Object} reqBody
 * @returns {Function} function that creates the transaction on client's account
 */
const chargeAccount = async (res, account, reqBody) => {
  const { amount, transactionType } = reqBody;
  const oldBalance = account.account_balance;
  if (reqBody.transactionType === 'debit' && oldBalance < amount) {
    return setServerResponse(res, 400, { error: 'Overdraft disallowed' });
  }
  const newBalance = transactionType === 'credit'
    ? Number(oldBalance) + Number(amount)
    : Number(oldBalance) - Number(amount);
  const transactionData = {
    ...reqBody,
    newBalance,
    date: new Date().toDateString()
  };
  const accountData = { account_balance: newBalance, id: account.id };
  await Accounts.findOneAndUpdate(accountData);
  const postingDetails = {
    res,
    transactionData,
    oldBalance,
    reqBody,
    account
  };
  return postTransaction(postingDetails);
};

/**
 * Get account owner and pass details to function for making charge
 * @name getAccountOwner
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {Function} function that makes charge on client's account
 */
const getAccountOwner = async (req, res) => {
  const account = await Accounts.findOne(req.body.accountNumber);
  if (!account) {
    return setServerResponse(res, 404, { error: 'Account not found' });
  }
  if (account.status !== 'active') {
    return setServerResponse(res, 400, { error: 'Account not activated' });
  }
  return chargeAccount(res, account, req.body);
};

/**
 * Identify account, validate and send request off for charging
 * @name createTransaction
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON} function that ensures account owner is valid or error
 * encountered while verifying
 */
const createTransaction = async (req, res) => {
  try {
    const staff = await Users.findOneById(req.body.cashierId);
    if (!staff) {
      return setServerResponse(res, 404, { error: 'Staff not found' });
    }
    const { tokenOwner } = res.locals;
    if (staff.email !== tokenOwner.email) {
      return setServerResponse(res, 403, { error: 'User and token mismatch' });
    }
    return getAccountOwner(req, res);
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * Get details of a single transaction.
 * @name getTransactionDetails
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON} array containing the details of the requested transaction
 */
const getTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transactions.findOne(req.params.id);
    if (!transaction) {
      return setServerResponse(res, 404, { error: 'Transaction not found' });
    }
    const account = await Accounts.findOne(transaction.account_number);
    const { tokenOwner } = res.locals;
    if (!tokenOwner.is_staff && tokenOwner.id !== account.owner) {
      return setServerResponse(res, 403, { error: 'Token and user mismatch' });
    }
    return setServerResponse(res, 200, { data: transaction });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * Get all transactions
 * @name getAllTransactions
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON} array containing all transactions performed
 */
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transactions.findAll();
    return setServerResponse(res, 200, { data: transactions });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

export {
  createTransaction,
  chargeAccount,
  getTransactionDetails,
  getAllTransactions
};
