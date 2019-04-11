import users from './users';
import accounts from './accounts';

export default (router) => {
  users(router);
  accounts(router);
};
