const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
require("dotenv").config();
const { SECRET_KEY } = process.env;
const { registerSchema, loginSchema } = require("../shemas/auth");
const ctrlWrap = require("../helpers/ctrlWrap");
const httpError = require("../helpers/httpError");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

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
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });
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
  const { subscription } = req.body;
  req.user.subscription = subscription;
  await req.user.save();
  res.json({
    message: "Subscription updated successfully",
    subscription: req.user.subscription,
  });
};

const changeAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  // await fs.rename(tempUpload, resultUpload);
  const image = await Jimp.read(tempUpload);
  image.resize(250, 250);
  await image.writeAsync(resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
};

module.exports = {
  loginUser: ctrlWrap(loginUser),
  registerUser: ctrlWrap(registerUser),
  logoutUser: ctrlWrap(logoutUser),
  getCurrent: ctrlWrap(getCurrent),
  changeSubscription: ctrlWrap(changeSubscription),
  changeAvatar: ctrlWrap(changeAvatar),
};
