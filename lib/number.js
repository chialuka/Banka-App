import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const { ACCESS_URL } = process.env;

/**
 * check against known network providers
 * @name checkPhoneNetwork
 * @param {Integer} number
 * @returns {String} network provider for the provided phone number or error
 */
const checkPhoneNetwork = (number) => {
  const numberLength = number.toString().length;
  if (numberLength !== 11 && numberLength !== 13) {
    return 'Invalid number';
  }
  const prefix = number.toString().slice(-10, -7);
  const networks = new Map([
    ['MTN', ['803', '703', '903', '806', '706', '813', '810', '814', '816']],
    ['GLO', ['805', '705', '905', '807', '815', '811', '905']],
    ['AIRTEL', ['802', '902', '701', '808', '708', '812']],
    ['ETISALAT', ['809', '909', '817', '818']],
  ]);
  const carrier = [];
  networks.forEach((x, y) => carrier.push(x.includes(prefix) ? y : null));
  const ans = carrier.find(a => a !== null);
  return ans !== undefined ? ans : 'Network not found';
};

/**
 * Check whether number provided for airtime recharge is correct
 * If there is no body in the response then call manual function
 * for checking network provider
 * @name checkNumberValidity
 * @async
 * @param {Integer} number
 * @returns {JSON} data about phone number checked via an external API
 */
const checkNumberValidity = async (number) => {
  try {
    const data = await fetch(
      `${ACCESS_URL}&number=${number}&country_code=NG`,
    );
    if (!data) {
      checkPhoneNetwork(number);
    }
    const jsonData = await data.json();
    return jsonData;
  } catch (error) {
    return error;
  }
};

export { checkNumberValidity, checkPhoneNetwork };
