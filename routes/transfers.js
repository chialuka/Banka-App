import Joi from 'joi';
import createTransfer from '../controllers/transfers';
import { authorizeClient } from '../middlewares/auth';
import validateBodyPayload from '../middlewares/validators';

export default (router) => {
  router.route('/transfers').post(
    validateBodyPayload({
      amount: Joi.number().required(),
      description: Joi.string().required(),
      senderAccount: Joi.number()
        .min(5000000000)
        .max(5999999999)
        .required(),
      receiverAccount: Joi.number()
        .min(5000000000)
        .max(5999999999)
        .required(),
    }),
    authorizeClient,
    createTransfer,
  );
};
