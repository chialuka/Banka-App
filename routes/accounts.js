import Joi from 'joi';
import {
  createAccount,
  patchAccount,
  deleteAccount,
  getAccountDetails,
  getAllAccounts,
} from '../controllers/accounts';
import {
  validateBodyPayload,
  validateIdParams,
} from '../middlewares/validators';
import {
  authorizeClient,
  authorizeAdmin,
  authorizeStaff,
  authenticateLogin,
} from '../middlewares/auth';

export default (router) => {
  router
    .route('/accounts')
    .post(
      validateBodyPayload({
        accountType: Joi.string()
          .valid('savings', 'current')
          .required(),
        id: Joi.number().required(),
        openingBalance: Joi.number().required(),
      }),
      authorizeClient,
      createAccount,
    )
    .get(authorizeStaff, getAllAccounts);

  router
    .route('/accounts/:id')
    .patch(
      validateBodyPayload({
        status: Joi.string()
          .valid('dormant', 'active')
          .required(),
      }),
      validateIdParams,
      authorizeAdmin,
      patchAccount,
    )
    .delete(validateIdParams, authorizeStaff, deleteAccount)
    .get(validateIdParams, authenticateLogin, getAccountDetails);
};
