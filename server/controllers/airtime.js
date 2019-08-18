import * as Users from '../models/users';
import * as Accounts from '../models/accounts';
import { checkNumberValidity } from '../lib/number';
import { setServerResponse } from '../utils';
import { chargeAccount } from './transactions';
import * as Mailer from './mailer';

/**
 * Call API lib function that checks number validity. If number is valid
 * then call function to deduct amount from client's account and then
 * call function to send email to client
 * @name checkValidNumber
 * @async
 * @param {Object} res
 * @param {Object} account
 * @param {Object} reqBody
 * @returns {JSON} message informing the user that their airtime purchase
 * was either successful or not
 */
const checkValidNumber = async (res, account, reqBody) => {
  const number = reqBody.phoneNumber;
  if (number.length !== 11 && number.length !== 13) {
    return setServerResponse(res, 400, { error: 'Number invalid' });
  }
  const formattedNumber = `0${number.slice(-10)}`;
  const validNumber = await checkNumberValidity(formattedNumber, res);
  if (validNumber !== 'Network not found' || validNumber.valid) {
    const network = validNumber.carrier
      ? validNumber.carrier.split(' ')[0]
      : validNumber;
    const carrier = network !== 'Emerging' ? network : 'Etisalat';
    const user = await Users.findOneById(account.owner);
    await chargeAccount(res, account, reqBody);
    Mailer.sendAirtimeEmail(account, reqBody, user, carrier);
    return setServerResponse(res, 200, {
      message: `${carrier} airtime purchase of ${reqBody.amount} successful`
    });
  }
  return setServerResponse(res, 400, { error: 'Number invalid' });
};

/**
 * Check to ensure account is valid and active. Add transaction type
 * and description and then call function to check number validity
 * @name purchaseAirtime
 * @async
 * @param {Object} req
 * @param {Object} res
 * @returns {Function} function that deducts airtime amount from
 * the client's account
 */
const purchaseAirtime = async (req, res) => {
  try {
    const account = await Accounts.findOne(req.body.accountNumber);
    if (!account) {
      return setServerResponse(res, 404, { error: 'Account not found' });
    }
    const { tokenOwner } = res.locals;
    if (tokenOwner.id !== account.owner) {
      return setServerResponse(res, 403, { error: 'Token and user mismatch' });
    }
    if (account.status !== 'active') {
      return setServerResponse(res, 400, {
        error: 'Account not activated'
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
