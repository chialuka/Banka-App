import { setServerResponse } from '../utils';
import { chargeAccount } from './transactions';
import * as Accounts from '../models/accounts';

/**
 * Charge the client initiating the transfer
 * and credit the other client.
 * @name createTransfer
 * @async
 * @param {Object} req
 * @param {Object} res
 * @param {Object} senderAccount
 * @param {Object} receiverAccount
 * @returns {JSON} mesage informing client of the success of their
 * transfer or the error encountered in the process
 */
const makeCharges = async (req, res, senderAccount, receiverAccount) => {
  try {
    const debitClient = {
      ...req.body,
      transactionType: 'debit',
      accountNumber: req.body.senderAccount,
    };
    const creditClient = {
      ...req.body,
      transactionType: 'credit',
      accountNumber: req.body.receiverAccount,
    };
    await chargeAccount(res, senderAccount, debitClient);
    await chargeAccount(res, receiverAccount, creditClient);
    return setServerResponse(res, 200, {
      Message: `Transfer of N${req.body.amount} successful`,
    });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * validate the receiver in a transfer transaction to ensure
 * account exists and is not dormant.
 * If successful, then call function to charge client
 * @name validateReceiver
 * @async
 * @param {Object} req
 * @param {Object} res
 * @param {Object} senderAccount
 * @returns {function} makeCharges function that makes charge on
 * accounts of both customers
 */
const validateReceiver = async (req, res, senderAccount) => {
  const receiverAccount = await Accounts.findOne(req.body.receiverAccount);
  if (!receiverAccount) {
    return setServerResponse(res, 404, { error: 'Receiver account not found' });
  }
  if (receiverAccount.status !== 'active') {
    return setServerResponse(res, 400, {
      error: 'Receiver account not activated',
    });
  }
  return makeCharges(req, res, senderAccount, receiverAccount);
};

/**
 * validate the sender's account to ensure the account exists and isn't dormant
 * If checks pass, then call function to validate receiver
 * @name validateSender
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {function} validateReceiver function
 */
const validateSender = async (req, res) => {
  const senderAccount = await Accounts.findOne(req.body.senderAccount);
  if (!senderAccount) {
    return setServerResponse(res, 404, { error: 'Sender account not found' });
  }
  const { tokenOwner } = res.locals;
  if (tokenOwner.id !== senderAccount.owner_id) {
    return setServerResponse(res, 403, { error: 'Token and user mismatch' });
  }
  if (senderAccount.status !== 'active') {
    return setServerResponse(res, 400, {
      error: 'Sender account not activated',
    });
  }
  return validateReceiver(req, res, senderAccount);
};

/**
 * pass the res object and values from the req object on to the validators
 * @name createTransfer
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {Function} validateSender function
 */
const createTransfer = async (req, res) => validateSender(req, res);

export default createTransfer;
