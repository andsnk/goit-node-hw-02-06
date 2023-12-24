const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
require("dotenv").config();
const { SECRET_KEY, BASE_URL } = process.env;
const { registerSchema, loginSchema, emailSchema } = require("../shemas/auth");
const ctrlWrap = require("../helpers/ctrlWrap");
const httpError = require("../helpers/httpError");
const sendEmail = require("../helpers/sendEmail");
// const fs = require("fs/promises");

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
  if (!user.verify) {
    throw httpError(401, "Verification failed");
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
  const verificationCode = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationCode,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationCode}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

const verifyEmail = async (req, res, next) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw httpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: null,
  });
  res.json({ message: "Verification successful" });
};

const resendVerifyEmail = async (req, res, next) => {
  const { error } = emailSchema.validate(req.body);
  if (error) {
    throw httpError(400, "Missing required field email");
  }

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(404, "User not found");
  }
  if (user.verify) {
    throw httpError(400, "Verification has already been passed");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationCode}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verification email sent" });
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
  verifyEmail: ctrlWrap(verifyEmail),
  resendVerifyEmail: ctrlWrap(resendVerifyEmail),
  logoutUser: ctrlWrap(logoutUser),
  getCurrent: ctrlWrap(getCurrent),
  changeSubscription: ctrlWrap(changeSubscription),
  changeAvatar: ctrlWrap(changeAvatar),
};
