import users from './users';
import accounts from './accounts';
import transactions from './transactions';
import transfers from './transfers';

export default (router) => {
  users(router);
  accounts(router);
  transactions(router);
  transfers(router);
};
