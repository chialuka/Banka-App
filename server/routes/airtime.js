import Joi from 'joi';
import { validateBodyPayload } from '../middlewares/validators';
import purchaseAirtime from '../controllers/airtime';
import { authorizeClient } from '../middlewares/auth';

export default (router) => {
  router.route('/airtime').post(
    validateBodyPayload({
      amount: Joi.number().positive().integer().required(),
      phoneNumber: Joi.string().required().min(11),
      accountNumber: Joi.number()
        .min(5000000000)
        .max(5999999999)
        .positive()
        .integer()
        .required(),
    }),
    authorizeClient,
    purchaseAirtime,
  );
};
