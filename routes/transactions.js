import Joi from 'joi';
import createTransaction from '../controllers/transactions';
import { authorizeStaff } from '../middlewares/auth';
import { validateBodyPayload } from '../middlewares/validators';

export default (router) => {
  router.route('/transactions').post(
    validateBodyPayload({
      amount: Joi.number().required(),
      description: Joi.string().required(),
      accountNumber: Joi.number().min(5000000000).max(5999999999).required(),
      cashierId: Joi.number().required(),
      transactionType: Joi.string()
        .valid('credit', 'debit')
        .required(),
    }),
    authorizeStaff,
    createTransaction,
  );
};
