import Joi from 'joi';
import {
  createAccount,
  patchAccount,
  deleteAccount,
} from '../controllers/accounts';
import {
  validateBodyPayload,
  validateIdParams,
} from '../middlewares/validators';
import {
  authorizeClient,
  authorizeAdmin,
  authorizeStaff,
} from '../middlewares/auth';

export default (router) => {
  router.route('/accounts').post(
    validateBodyPayload({
      accountType: Joi.string()
        .valid('savings', 'current')
        .required(),
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      openingBalance: Joi.number().required(),
    }),
    authorizeClient,
    createAccount,
  );

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
    .delete(validateIdParams, authorizeStaff, deleteAccount);
};
