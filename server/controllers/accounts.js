import models from '../models';
import { setServerResponse, generateAccountNumber } from '../utils';
import sendMail from '../lib/mail';

const { Users, Accounts } = models;

/**
 * @name createAccount
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
    const { firstname, lastname, email } = user;
    const accObj = {
      accountNumber,
      firstname,
      lastname,
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
      has been successfully opened with Banka.
      Thank you for banking with us.</p>`,
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

export default createAccount;
