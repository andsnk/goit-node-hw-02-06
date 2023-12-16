const express = require("express");
const authenticate = require("../../middlewares/authenticate");

const router = express.Router();

const {
  loginUser,
  registerUser,
  logoutUser,
  getCurrent,
  changeSubscription,
} = require("../../controllers/auth");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", authenticate, logoutUser);
router.get("/current", authenticate, getCurrent);
router.patch("/", authenticate, changeSubscription);

module.exports = router;
