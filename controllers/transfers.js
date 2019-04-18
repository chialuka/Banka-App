import { setServerResponse } from '../utils';
import { chargeAccount } from './transactions';
import models from '../models';

const { Accounts } = models;

/**
 * Charge the client initiating the transfer
 * and credit the other client.
 * @name createTransfer
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const makeCharges = async (req, res, senderAccount, receiverAccount) => {
  try {
    const debitClient = { ...req.body, transactionType: 'debit' };
    const creditClient = { ...req.body, transactionType: 'credit' };
    await chargeAccount(res, senderAccount, debitClient);
    await chargeAccount(res, receiverAccount, creditClient);
    return setServerResponse(res, 200, {
      Message: `Transfer of N${req.body.amount} successful`,
    });
  } catch (error) {
    return setServerResponse(res, 500, { error: { ...error } });
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
 * @returns {function}
 */
const validateReceiver = async (req, res, senderAccount) => {
  const receiverAccount = await Accounts.findOne(
    'accountNumber',
    Number(req.body.receiverAccount),
  );
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
 * @returns {function} validateReceiver
 */
const validateSender = async (req, res) => {
  const senderAccount = await Accounts.findOne(
    'accountNumber',
    Number(req.body.senderAccount),
  );
  if (!senderAccount) {
    return setServerResponse(res, 404, { error: 'Sender account not found' });
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
 * @returns @function validateReceiver
 */
const createTransfer = async (req, res) => validateSender(req, res);

export default createTransfer;
