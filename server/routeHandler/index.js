import Joi from 'joi';
import createUser, {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
} from '../controllers/users';
import validateBodyPayload from '../middlewares/validators';

export default (router) => {
  router.route('/users').get(getUsers);

  router.route('/users/auth/signup').post(
    validateBodyPayload({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      email: Joi.string().email({ minDomainAtoms: 2 }),
      password: Joi.string().min(6),
      type: Joi.string(),
      isAdmin: Joi.boolean(),
    }),
    createUser,
  );

  router.route('/users/auth/signin').post(
    validateBodyPayload({
      email: Joi.string().email({ minDomainAtoms: 2 }),
      password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/),
    }),
    loginUser,
  );

  router
    .route('/users/:user_id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);
};
