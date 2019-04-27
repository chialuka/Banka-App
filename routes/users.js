import Joi from 'joi';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  getUserAccounts,
} from '../controllers/users';
import {
  validateBodyPayload,
  validateIdParams,
} from '../middlewares/validators';
import {
  authorizeClient,
  authorizeStaff,
  authorizeAdmin,
  authenticateLogin,
} from '../middlewares/auth';

export default (router) => {
  router.route('/users').get(authorizeStaff, getUsers);

  router.route('/users/auth/signup').post(
    validateBodyPayload({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string()
        .min(6)
        .required(),
    }),
    createUser,
  );

  router.route('/staff/auth/signup').post(
    validateBodyPayload({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string()
        .min(6)
        .required(),
      isAdmin: Joi.boolean().required(),
    }),
    authorizeAdmin,
    createUser,
  );

  router.route('/users/auth/signin').post(
    validateBodyPayload({
      email: Joi.string()
        .email({ minDomainAtoms: 2 })
        .required(),
      password: Joi.string()
        .min(6)
        .required(),
    }),
    loginUser,
  );

  router
    .route('/users/accounts/:id')
    .get(validateIdParams, authenticateLogin, getUserAccounts);

  router
    .route('/users/:id')
    .get(validateIdParams, authorizeStaff, getUser)
    .put(
      validateBodyPayload({
        email: Joi.string().email({ minDomainAtoms: 2 }),
        firstname: Joi.string(),
        lastname: Joi.string(),
        password: Joi.string().min(6),
      }),
      validateIdParams,
      authorizeClient,
      updateUser,
    )
    .delete(validateIdParams, authorizeStaff, deleteUser);
};
