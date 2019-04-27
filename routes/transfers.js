import Joi from 'joi';
import createTransfer from '../controllers/transfers';
import { authorizeClient } from '../middlewares/auth';
import { validateBodyPayload } from '../middlewares/validators';

export default (router) => {
  router.route('/transfers').post(
    validateBodyPayload({
      amount: Joi.number().integer().positive().required(),
      description: Joi.string().required(),
      senderAccount: Joi.number()
        .min(5000000000)
        .max(5999999999)
        .positive()
        .integer()
        .required(),
      receiverAccount: Joi.number()
        .min(5000000000)
        .max(5999999999)
        .positive()
        .integer()
        .required(),
    }),
    authorizeClient,
    createTransfer,
  );
};
