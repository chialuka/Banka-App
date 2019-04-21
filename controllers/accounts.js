import * as Accounts from '../models/accounts';
import * as Users from '../models/users';
import { setServerResponse, generateAccountNumber } from '../utils';
import sendMail from '../lib/mail';

/**
 * send off an email to client's registered email once account is opened
 * @name sendNewAccountMail
 * @param {Object} user
 * @param {Object} accObj
 * @returns {null}
 */
const sendNewAccountMail = (user, accObj) => {
  const composeEmail = {
    to: user.email,
    subject: 'New Banka Account',
    text: 'You have opened a new Banka account',
    message: `<h1>New Banka Account</h1>
    <p>Hi ${user.first_name},</p>
    <p>This is to inform you that your new ${accObj.accountType} account with
    account number: ${Number(accObj.accountNumber)}
    and opening balance: N${accObj.openingBalance}
    has been successfully opened with Banka.</p>
    <p>Thank you for choosing Banka.</p>
    <p> Best wishes.</p>`,
  };
  sendMail(composeEmail);
};

/**
 * ensure user exists, create account and call function to send email to user
 * @name createAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const createAccount = async (req, res) => {
  try {
    const user = await Users.findOneById(req.body.id);
    if (!user) {
      return setServerResponse(res, 404, { error: 'Account owner not found' });
    }
    const { tokenOwner } = res.locals;
    if (tokenOwner.email !== user.email) {
      return setServerResponse(res, 403, { error: 'Token and user mismatch' });
    }
    const accountNumber = Number(generateAccountNumber());
    const createdOn = (new Date()).toGMTString();
    const accObj = {
      accountNumber, createdOn, status: 'draft', ...req.body,
    };
    const newAccount = await Accounts.create(accObj);
    sendNewAccountMail(user, accObj);
    return setServerResponse(res, 201, { data: [{ ...newAccount }] });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * send email to client whose account was deactivated
 * @name sendDeactivationMail
 * @param {Object} account
 * @return {null}
 */
const sendDeactivationMail = (email, account) => {
  const deactivationEmail = {
    to: email,
    subject: 'Account Deactivation',
    message: `<h1>Account Deactivation</h1>
    <p>Your ${account.account_type} account 
    with account number ${account.account_number} has been deactivated
    and is dormant.</p>
    <p>Please note that you cannot make transactions until 
    your account is activated again. 
    Contact our nearest branch or reply this email for more information.</p>
    <p>Thank you for choosing Banka.</p>
    <p> Best wishes.</p>`,
  };
  sendMail(deactivationEmail);
};

/**
 * send email to client whose account was activated
 * @name sendActivationMail
 * @param {Object} account
 * @returns {null}
 */
const sendActivationMail = (email, account) => {
  const activatedAccountEmail = {
    to: email,
    subject: 'Account Activation',
    message: `<h1>Account Activation</h1>
    <p>Dear esteemed customer, </p>
    <p>Your ${account.account_type} account 
    with account number ${account.account_number} has been activated.</p>
    <p>You can now make transactions with your account 
    and with your issued ATM card.</p>
    <p>Thank you for choosing Banka.</p>
    <p> Best wishes.</p>`,
  };
  sendMail(activatedAccountEmail);
};

/**
 * Activate or deactivate client account
 * then call function to send relevant email to the client
 * @name patchAccount
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {JSON Object}
 */
const patchAccount = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.params.id);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const user = await Users.findOneById(account.owner_id);
    if (!user) {
      return setServerResponse(res, 404, { error: 'Account owner not found' });
    }
    const { status } = req.body;
    const data = { status, id: account.id };
    const patchedUser = await Accounts.findOneAndUpdate(data);
    if (status === 'dormant') {
      sendDeactivationMail(user.email, account);
    }
    sendActivationMail(user.email, account);
    return setServerResponse(res, 200, { data: [{ ...patchedUser }] });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

/**
 * send email to customer whose account was deleted
 * @name sendDeleteMail
 * @param {Object} account
 * @returns {null}
 */
const sendDeleteMail = (account) => {
  const composeEmail = {
    to: account.email,
    subject: 'New Banka Account',
    message: `<h1>New Banka Account</h1>
    <p>Dear esteemed customer,</p>
    <p>This is to inform you that your ${account.accountType} account with
    account number: ${Number(account.accountNumber)}
    has been deleted from Banka.</p>
    <p>Please visit a branch nearest to you 
    or reply this email for more details.</p>
    <p>Thank you for choosing Banka.</p>
    <p> Best wishes.</p>`,
  };
  sendMail(composeEmail);
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
    const account = await Accounts.findOne(req.params.id);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const deletedAccount = await Accounts.findOneAndDelete(req.params.id);
    if (!deletedAccount) {
      return setServerResponse(res, 500, { error: 'Error deleting account' });
    }
    sendDeleteMail(account);
    return setServerResponse(res, 200, {
      message: 'Account successfully deleted',
    });
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

export { createAccount, patchAccount, deleteAccount };
