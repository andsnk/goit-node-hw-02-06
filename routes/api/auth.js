const express = require("express");
const authenticate = require("../../middlewares/authenticate");
const upload = require("../../middlewares/upload");

const router = express.Router();

const {
  loginUser,
  registerUser,
  logoutUser,
  getCurrent,
  changeSubscription,
  changeAvatar,
} = require("../../controllers/auth");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", authenticate, logoutUser);
router.get("/current", authenticate, getCurrent);
router.patch("/", authenticate, changeSubscription);
router.patch("/avatars", authenticate, upload.single("avatar"), changeAvatar);

module.exports = router;
