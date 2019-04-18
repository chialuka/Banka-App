import * as Transactions from '../models/transactions';
import * as Accounts from '../models/accounts';
import * as Users from '../models/users';
import sendMail from '../lib/mail';
import { setServerResponse, capitalize } from '../utils';


/**
 * Send an email to the specified client stating the transaction that occured
 * @name mailSender
 * @param {String} email
 * @param {String} firstname
 * @param {Object} data
 * @returns {null}
 */
const mailSender = (email, firstname, data) => {
  const composeEmail = {
    to: email,
    subject: 'Banka Transaction alert',
    message: `<h3>Banka Transaction Alert Service</h3>
    <p>Dear ${capitalize(firstname)}, </p>
    <p>Please be informed that a ${capitalize(data.transactionType)} transaction
    occured on your account</p>
    <p>Kindly find details of the transaction below</p>
    <ul>
    <li>Account Number: ${data.accountNumber}</li>
    <li>Description: ${data.description}</li>
    <li>Transaction Amount: ${data.amount}</li>
    <li>Transaction Date: ${data.date}</li>
    <li>Account Balance: NGN${data.accountBalance}</li>
    </ul>
    <p>Thank you for choosing Banka</p>
    <p>Best wishes.</p>`,
  };
  sendMail(composeEmail);
};

/**
 * Charge the account of the provided client with the specified amount and save
 * @name chargeAccount
 * @async
 * @param {Object} res
 * @param {Object} account
 * @param {Object} reqBody
 * @return {JSON Object}
 */
const chargeAccount = async (res, account, reqBody) => {
  const { amount, transactionType } = reqBody;
  const balance = account.account_balance;
  if (reqBody.transactionType === 'debit' && balance < amount) {
    return setServerResponse(res, 400, { error: 'Overdraft disallowed' });
  }
  const accountBalance = transactionType === 'credit'
    ? balance + amount : balance - amount;
  const newDate = new Date();
  const transactionData = {
    ...reqBody, accountBalance, date: newDate.toGMTString(),
  };
  const accountData = { ...account, accountBalance };
  await Accounts.findOneAndUpdate(accountData);
  const user = await Users.findOneByEmail(account.email);
  if (!user) {
    return setServerResponse(res, 404, { error: 'Account owner not found' });
  }
  const newTransaction = await Transactions.create(transactionData);
  mailSender(account.email, user.firstname, transactionData);
  if (reqBody.senderAccount || reqBody.receiverAccount) return null;
  return setServerResponse(res, 201, { data: { ...newTransaction } });
};

/**
 * Identify account, validate and send request off for charging
 * @name createTransaction
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const createTransaction = async (req, res) => {
  try {
    const staff = await Users.findOneById(Number(req.body.cashierId));
    if (!staff) {
      return setServerResponse(res, 404, { error: 'Staff not found' });
    }
    const { tokenOwner } = res.locals;
    if (staff.email !== tokenOwner.email) {
      return setServerResponse(res, 403, { error: 'User and token mismatch' });
    }
    const account = await Accounts.findOne(
      'accountNumber', Number(req.body.accountNumber),
    );
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    if (account.status !== 'active') {
      return setServerResponse(res, 400, { error: 'Account not activated' });
    }
    return chargeAccount(res, account, req.body);
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

export { chargeAccount };

export default createTransaction;
