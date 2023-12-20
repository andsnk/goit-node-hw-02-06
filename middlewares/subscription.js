const httpError = require("../helpers/httpError");

const subscription = async (req, res, next) => {
  const allowedSubscriptions = ["starter", "pro", "business"];
  const { subscription } = req.body;
  if (!subscription || !allowedSubscriptions.includes(subscription)) {
    return next(httpError(400, "Invalid subscription value"));
  }

  next();
};

module.exports = subscription;
