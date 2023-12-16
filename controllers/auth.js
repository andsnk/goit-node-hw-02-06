const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { SECRET_KEY } = process.env;
const { registerSchema, loginSchema } = require("../shemas/auth");
const ctrlWrap = require("../helpers/ctrlWrap");
const httpError = require("../helpers/httpError");

const loginUser = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw httpError(401, "Email or password invalid");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  //   res.json({ token });
  const newUser = await User.findByIdAndUpdate(
    user._id,
    { token },
    { select: "-token -createdAt -updatedAt -password" }
  );
  res.json({ newUser, token });
};

const registerUser = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw httpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });
  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const logoutUser = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({ message: "Logout success" });
};

const getCurrent = async (req, res, next) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const changeSubscription = async (req, res, next) => {
  const allowedSubscriptions = ["starter", "pro", "business"];
  const { subscription } = req.body;
  if (!subscription || !allowedSubscriptions.includes(subscription)) {
    throw httpError(400, "Invalid subscription value");
  }
  req.user.subscription = subscription;
  await req.user.save();
  res.json({
    message: "Subscription updated successfully",
    subscription: req.user.subscription,
  });
};

module.exports = {
  loginUser: ctrlWrap(loginUser),
  registerUser: ctrlWrap(registerUser),
  logoutUser: ctrlWrap(logoutUser),
  getCurrent: ctrlWrap(getCurrent),
  changeSubscription: ctrlWrap(changeSubscription),
};
