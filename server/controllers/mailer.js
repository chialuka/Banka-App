import { capitalize } from '../utils';
import sendMail from '../lib/mail';

/**
 * Send email with OTP to user for resetting their password
 * @name sendResetPasswordMail
 * @param {Object} user
 * @param {Number} otp
 * @returns {Function} Function that sends password reset email to the user
 */
const sendResetPasswordMail = (user, otp) => {
  const mail = {
    to: user.email,
    subject: 'Password Reset',
    message: `<h4> Password Reset </h4>
    <p>Dear ${capitalize(user.first_name)}, </p>
    <p>You made a request to reset your password.
    Please provide this OTP: ${otp} alongside your
    new password.</p>
    <p>The OTP expires in ten minutes.</p>
    <p>Thank you for choosing Banka.</p>
    <p>Best wishes</p>`
  };
  sendMail(mail);
};

/**
 * Send email informing client of the debit transaction that occured
 * on their account and the purpose of the debit
 * @name sendAirtimeEmail
 * @async
 * @param {Object} account
 * @param {Object} reqBody
 * @param {Object} user
 * @param {String} carrier
 * @returns {Null} Sends email to client informing them of
 * their successful airtime purchase
 */
const sendAirtimeEmail = (account, reqBody, user, carrier) => {
  const composeMail = {
    to: user.email,
    subject: 'Banka Aitime alert',
    message: `<h3>Banka Transaction Service</h3>
    <p>Dear ${capitalize(user.first_name)}, </p>
    <p>Your airtime purchase of NGN ${reqBody.amount}
    on your ${account.account_type} account for 
    the ${carrier} number- 
    ${reqBody.phoneNumber} was successful.</p>
    <p>Thank you for choosing Banka.</p>
    <p>Best wishes.</p>`
  };
  sendMail(composeMail);
};

/**
 * Send an email to the specified client stating the transaction that occured
 * @name sendTransactionEmail
 * @param {String} email
 * @param {String} firstname
 * @param {Object} data
 * @returns {Null} sends email to client informing them of the transaction
 * that occured on their account
 */
const sendTransactionEmail = (email, firstname, data) => {
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
    <li>Transaction Amount: NGN ${data.amount}</li>
    <li>Transaction Date: ${data.date}</li>
    <li>Account Balance: NGN${data.newBalance}</li>
    </ul>
    <p>Thank you for choosing Banka.</p>
    <p>Best wishes.</p>`
  };
  sendMail(composeEmail);
};

/**
 * send off an email to client's registered email once account is opened
 * @name sendNewAccountMail
 * @param {Object} user
 * @param {Object} accObj
 * @returns {Null} Function sends email to client
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
    and opening balance: NGN ${accObj.openingBalance}
    has been successfully opened with Banka.</p>
    <p>Thank you for choosing Banka.</p>
    <p> Best wishes.</p>`
  };
  sendMail(composeEmail);
};

/**
 * send email to client whose account was deactivated
 * @name sendDeactivationMail
 * @param {String} email
 * @param {Object} account
 * @return {Null} Sends email informing client of their account
 * deactivation
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
    <p> Best wishes.</p>`
  };
  sendMail(deactivationEmail);
};

/**
 * send email to client whose account was activated
 * @name sendActivationMail
 * @param {String} email
 * @param {Object} account
 * @returns {Null} sends email informing client that their account
 * has been activated
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
    <p> Best wishes.</p>`
  };
  sendMail(activatedAccountEmail);
};

/**
 * send email to customer whose account was deleted
 * @name sendDeleteMail
 * @param {Object} account
 * @returns {Null} Sends an email to the client informing them
 * that their account has been deleted
 */
const sendDeleteAccountMail = (account) => {
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
    <p> Best wishes.</p>`
  };
  sendMail(composeEmail);
};

export {
  sendAirtimeEmail,
  sendTransactionEmail,
  sendNewAccountMail,
  sendDeactivationMail,
  sendActivationMail,
  sendDeleteAccountMail,
  sendResetPasswordMail
};
