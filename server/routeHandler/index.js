const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require("../controllers/users");

module.exports = router => {
  router
    .route("/users")
    .get(getUsers)
    .post(createUser);

  router
    .route("/users/:user_id")
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);
};
