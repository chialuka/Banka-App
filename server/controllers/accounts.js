import models from '../models';
import { setServerResponse, generateAccountNumber } from '../utils';
import sendMail from '../lib/mail';

const { Users, Accounts } = models;

/**
 * @name createAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const createAccount = async (req, res) => {
  try {
    const user = await Users.findOne(req.body.email);
    if (!user) {
      return setServerResponse(res, 404, { error: 'User not found' });
    }
    const accountNumber = Number(generateAccountNumber());
    const { firstname, email, id } = user;

    const currentDate = new Date();
    const createdOn = currentDate.toGMTString();
    const accObj = {
      accountNumber,
      createdOn,
      status: 'draft',
      owner: id,
      ...req.body,
    };
    const newAccount = await Accounts.create(accObj);

    const { accountType, openingBalance } = accObj;
    const composeEmail = {
      to: email,
      subject: 'New Banka Account',
      text: 'You have opened a new Banka account',
      message: `<h1>New Banka Account</h1>
      <p>Hi ${firstname},</p>
      <p>This is to inform you that your new ${accountType} account with
      account number: ${Number(accountNumber)}
      and opening balance: N${openingBalance}
      has been successfully opened with Banka.</p>
      <p>Thank you for choosing Banka.</p>
      <p> Best wishes.</p>`,
    };

    return Promise.all([
      setServerResponse(res, 201, {
        data: { ...newAccount },
      }),
      // sendMail(composeEmail),
    ]);
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

/**
 * @name patchAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const patchAccount = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.params.account_id);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const user = await Users.findOne(account.email);
    if (!user) {
      return setServerResponse(res, 404, { error: 'Account owner not found' });
    }
    const { status } = req.body;
    const data = {
      ...account,
      status,
    };
    const patchedUser = await Accounts.findOneAndUpdate(data);
    const { email, accountType, accountNumber } = account;
    let composeEmail;
    if (status === 'dormant') {
      composeEmail = {
        to: email,
        subject: 'Account Deactivation',
        message: `<h1>Account Deactivation</h1>
        <p>We regret to inform you that your ${accountType} account 
        with account number ${accountNumber} has been deactivated.</p>
        <p>Please note that you cannot make transactions until 
        your account is activated again. 
        Contact our nearest branch or reply this email for more information.</p>
        <p>Thank you for choosing Banka.</p>
        <p> Best wishes.</p>`,
      };
    } else {
      composeEmail = {
        to: email,
        subject: 'Account Activation',
        message: `<h1>Account Activation</h1>
        <p>We are pleased to inform you that your ${accountType} account 
        with account number ${accountNumber} has been activated.</p>
        <p>You can now make transactions with your account 
        and with your issued ATM card.</p>
        <p>Thank you for choosing Banka.</p>
        <p> Best wishes.</p>`,
      };
    }
    return Promise.all([
      setServerResponse(res, 200, { data: { ...patchedUser } }),
      // sendMail(composeEmail),
    ]);
  } catch (error) {
    return setServerResponse(res, error.status, { error });
  }
};

/**
 * @name deleteAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const deleteAccount = async (req, res) => {
  try {
    const id = req.params.account_id;
    const account = await Accounts.findOne(id);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const deletedAccount = await Accounts.findOneAndDelete(id);
    if (!deletedAccount) {
      return setServerResponse(res, 500, { error: 'Error deleting account' });
    }
    const { email, accountType, accountNumber } = account;
    const composeEmail = {
      to: email,
      subject: 'New Banka Account',
      text: 'You have opened a new Banka account',
      message: `<h1>New Banka Account</h1>
      <p>Dear esteemed customer,</p>
      <p>This is to inform you that your ${accountType} account with
      account number: ${Number(accountNumber)}
      has been deleted from Banka.</p>
      <p>Please visit a branch nearest to you 
      or reply this email for more details.</p>
      <p>Thank you for choosing Banka.</p>
      <p> Best wishes.</p>`,
    };
    return Promise.all([
      setServerResponse(res, 200, {
        message: 'Account successfully deleted',
      }),
      // sendMail(composeEmail),
    ]);
  } catch (error) {
    return setServerResponse(res, error.status, { error });
  }
};

export { createAccount, patchAccount, deleteAccount };
