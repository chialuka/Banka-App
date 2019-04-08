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
    const { email, type, openingBalance } = req.body;
    const user = await Users.findOne(email);
    if (!user) {
      return setServerResponse(res, 404, { error: 'User not found' });
    }
    const accountNumber = Number(generateAccountNumber());
    const { firstname, lastname } = user;
    const accObj = {
      accountNumber,
      firstname,
      lastname,
      ...req.body,
    };
    const newAccount = await Accounts.create(accObj);
    const transporter = await sendMail(firstname, accountNumber, email, type, openingBalance);

    console.log(transporter, 'transp');
    

    return setServerResponse(res, 201, { data: { ...newAccount } });
  } catch (error) {
    return setServerResponse(res, 500, {
      error: "We're sorry about this. We're working to fix the problem.",
    });
  }
};

export default createAccount;
