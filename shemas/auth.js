const Joi = require("joi");

const subscriptionList = ["starter", "pro", "business"];

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(24).required(),
  subscription: Joi.string().valid(...subscriptionList),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(24).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = { registerSchema, loginSchema, emailSchema };
