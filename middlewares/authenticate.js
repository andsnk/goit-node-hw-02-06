const jwt = require("jsonwebtoken");
require("dotenv").config();
const { SECRET_KEY } = process.env;
const User = require("../models/users");
const httpError = require("../helpers/httpError");

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    next(httpError(401));
  }
  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      next(httpError(401, "Not authorized"));
    }

    const allowedSubscriptions = ["starter", "pro", "business"];
    const { subscription } = req.body;
    if (!subscription || !allowedSubscriptions.includes(subscription)) {
      next(httpError(400, "Invalid subscription value"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(httpError(401, authorization));
  }
};

module.exports = authenticate;
