const express = require("express");
const router = express.Router();

// Auth controllers
const {
  sendOTP,
  signUp,
  login,
  changePassword,
} = require("../controllers/auth");

// Reset password controllers
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/resetPassword");

// Profile controllers
const { updateProfile, deleteAccount } = require("../controllers/profile");

// Middleware
const { authMiddleware } = require("../middlewares/Auth");

// ********** Auth routes **********
router.post("/sendotp", sendOTP);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/changepassword", authMiddleware, changePassword);

// ********** Reset Password routes **********
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

// ********** Profile routes **********
router.put("/updateProfile", authMiddleware, updateProfile);
router.delete("/deleteAccount", authMiddleware, deleteAccount);

module.exports = router;
