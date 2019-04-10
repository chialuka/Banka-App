import Joi from 'joi';
import createAccount from '../controllers/accounts';
import validateBodyPayload from '../middlewares/validators';
import { authorizeClient } from '../middlewares/auth';

export default (router) => {
  router.route('/accounts').post(
    validateBodyPayload({
      accountType: Joi.string().valid('savings', 'current').required(),
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      openingBalance: Joi.number().required(),
    }),
    authorizeClient,
    createAccount,
  );

//  router.route('/api/')
};
