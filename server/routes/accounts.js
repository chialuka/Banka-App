import Joi from 'joi';
import createAccount from '../controllers/accounts';
import validateBodyPayload from '../middlewares/validators';
import {authorizeClient} from '../middlewares/authorization';

export default (router) => {
  router.route('/accounts').post(
    validateBodyPayload({
      type: Joi.string().required(),
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      openingBalance: Joi.string().required(),
    }),
    authorizeClient,
    createAccount,
  );

//  router.route('/api/')
};
