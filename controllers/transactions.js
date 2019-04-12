import models from '../models';
import sendMail from '../lib/mail';
import { setServerResponse, capitalize } from '../utils';

const { Users, Accounts, Transactions } = models;

/**
 * @name createTransaction
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const createTransaction = async (req, res) => {
  try {
    const {
      cashierId,
      accountNumber,
      transactionType,
      amount,
      description,
    } = req.body;
    const staff = await Users.findOne('id', Number(cashierId));
    if (!staff) {
      setServerResponse(res, 404, { error: 'Staff not found' });
    }
    const { tokenOwner } = res.locals;
    if (staff.email !== tokenOwner.email) {
      return setServerResponse(res, 403, { error: 'User and token mismatch' });
    }
    const account = await Accounts.findOne(
      'accountNumber',
      Number(accountNumber),
    );
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    if (account.status !== 'active') {
      return setServerResponse(res, 400, { error: 'Account not activated' });
    }
    const originalBalance = account.accountBalance
      ? account.accountBalance
      : account.openingBalance;
    if (transactionType === 'debit' && originalBalance < amount) {
      return setServerResponse(res, 400, { error: 'Overdraft disallowed' });
    }
    const accountBalance = transactionType === 'credit'
      ? originalBalance + amount
      : originalBalance - amount;
    const newDate = new Date();
    const date = newDate.toGMTString();
    const transactionData = {
      ...req.body,
      accountBalance,
      date,
    };
    delete account.openingBalance;
    const accountData = {
      ...account,
      accountBalance,
    };
    await Accounts.findOneAndUpdate(accountData);
    const user = await Users.findOne('email', account.email);
    if (!user) {
      return setServerResponse(res, 404, { error: 'Account owner not found' });
    }
    const newTransaction = await Transactions.create(transactionData);

    const composeEmail = {
      to: account.email,
      subject: 'Banka Transaction alert',
      message: `<h3>Banka Transaction Alert Service</h3>
      <p>Dear ${capitalize(user.firstname)}, </p>
      <p>Please be informed that a ${capitalize(transactionType)} transaction
      occured on your account</p>
      <p>Kindly find details of the transaction below</p>
      <ul>
      <li>Account Number: ${accountNumber}</li>
      <li>Description: ${description}</li>
      <li>Transaction Amount: ${amount}</li>
      <li>Transaction Date: ${date}</li>
      <li>Account Balance: NGN${accountBalance}</li>
      </ul>
      <p>Thank you for choosing Banka</p>
      <p>Best wishes.</p>`,
    };

    return Promise.all([
      setServerResponse(res, 201, { data: { ...newTransaction } }),
      // sendMail(composeEmail),
    ]);
  } catch (error) {
    return setServerResponse(res, 500, {
      error,
    });
  }
};

export default createTransaction;
