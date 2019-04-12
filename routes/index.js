import users from './users';
import accounts from './accounts';
import transactions from './transactions';

export default (router) => {
  users(router);
  accounts(router);
  transactions(router);
};
