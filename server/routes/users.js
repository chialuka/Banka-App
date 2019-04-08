import Joi from 'joi';
import createUser, {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
} from '../controllers/users';
import validateBodyPayload from '../middlewares/validators';
import authorizeUser, { authorizeStaff } from '../middlewares/authorization';

export default (router) => {
  router.route('/users').get(authorizeStaff, getUsers);

  router.route('/users/auth/signup')
    .post(
      validateBodyPayload({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(6).required(),
        type: Joi.string().required(),
        isAdmin: Joi.boolean(),
      }),
      createUser,
    );

  router.route('/users/auth/signin')
    .post(
      validateBodyPayload({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(6).required(),
      }),
      loginUser,
    );

  router
    .route('/users/:user_id')
    .get(authorizeStaff, getUser)
    .put(
      validateBodyPayload({
        firstname: Joi.string(),
        lastname: Joi.string(),
        password: Joi.string().min(6),
      }),
      authorizeUser,
      updateUser,
    )
    .delete(authorizeStaff, deleteUser);
};
