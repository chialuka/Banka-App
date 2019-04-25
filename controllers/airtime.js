import * as Users from '../models/users';
import * as Accounts from '../models/accounts';
import { checkNumberValidity } from '../lib/number';
import { setServerResponse, capitalize } from '../utils';
import { chargeAccount } from './transactions';
import sendMail from '../lib/mail';

/**
 * Send email informing client of the debit transaction that occured
 * on their account and the purpose of the debit
 * @name sendAirtimeEmail
 * @async
 * @param {Object} account
 * @param {Object} reqBody
 * @param {Object} user
 * @param {String} carrier
 * @returns {Null}
 */
const sendAirtimeEmail = (account, reqBody, user, carrier) => {
  const composeMail = {
    to: user.email,
    subject: 'Banka Aitime alert',
    message: `<h3>Banka Transaction Service<h3>
    <p>Dear ${capitalize(user.first_name)}, </p>
    <p>Your airtime purchase of ${reqBody.amount}
    on your ${account.account_type} account for 
    the ${carrier} number- 
    ${reqBody.phoneNumber} was successful</p>
    <p>Thank you for choosing Banka</p>
    <p>Best wishes</p>`,
  };
  sendMail(composeMail);
};

/**
 * Call API lib function that checks number validity. If number is valid
 * then call function to deduct amount from client's account and then
 * call function to send email to client
 * @name checkValidNumber
 * @async
 * @param {Object} res
 * @param {Object} account
 * @param {Object} reqBody
 * @returns {Function}
 */
const checkValidNumber = async (res, account, reqBody) => {
  const formattedNumber = `0${reqBody.phoneNumber.slice(-10)}`;
  const validNumber = await checkNumberValidity(formattedNumber, res);
  if (!validNumber.valid) {
    return setServerResponse(res, 400, { error: 'Number invalid' });
  }
  const network = validNumber.carrier.split(' ')[0];
  const carrier = network !== 'Emerging' ? network : 'Etisalat';
  const user = await Users.findOneById(account.owner_id);
  await chargeAccount(res, account, reqBody);
  sendAirtimeEmail(account, reqBody, user, validNumber);
  return setServerResponse(res, 200, {
    message: `${carrier} airtime purchase of ${reqBody.amount} successful`,
  });
};

/**
 * Check to ensure account is valid and active. Add transaction type
 * and description and then call function to check number validity
 * @name purchaseAirtime
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {Function}
 */
const purchaseAirtime = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.body.accountNumber);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const { tokenOwner } = res.locals;
    if (tokenOwner.id !== account.owner_id) {
      return setServerResponse(res, 403, { error: 'Token and user mismatch' });
    }
    if (account.status !== 'active') {
      return setServerResponse(res, 400, {
        error: 'Account not activated',
      });
    }
    req.body.transactionType = 'debit';
    req.body.description = 'airtime';
    return checkValidNumber(res, account, req.body);
  } catch (error) {
    return setServerResponse(res, 500, { error });
  }
};

export default purchaseAirtime;
