import Joi from 'joi';
import { authorizeStaff, authenticateLogin } from '../middlewares/auth';
import {
  validateBodyPayload,
  validateIdParams,
} from '../middlewares/validators';
import {
  createTransaction,
  getAllTransactions,
  getTransactionDetails,
} from '../controllers/transactions';

export default (router) => {
  router
    .route('/transactions')
    .post(
      validateBodyPayload({
        amount: Joi.number().required(),
        description: Joi.string().required(),
        accountNumber: Joi.number()
          .min(5000000000)
          .max(5999999999)
          .required(),
        cashierId: Joi.number().required(),
        transactionType: Joi.string()
          .valid('credit', 'debit')
          .required(),
      }),
      authorizeStaff,
      createTransaction,
    )
    .get(authorizeStaff, getAllTransactions);

  router
    .route('/transactions/:id')
    .get(validateIdParams, authenticateLogin, getTransactionDetails);
};
