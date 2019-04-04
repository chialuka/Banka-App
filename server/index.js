const express = require("express");
const routes = require("./routeHandler");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

const router = express.Router();

routes(router);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(morgan("dev"));

app.use("/api", router);

app.use(function(req, res, next) {
  return res.status(404).json({ message: "Route" + req.url + " Not found." });
});

app.listen(2800, () => {
  console.log("We make magic on port 2800");
});

module.exports = app
