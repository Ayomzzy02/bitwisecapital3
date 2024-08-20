const express = require("express");
const router = express.Router();

const {
  signInUser,
  signUpUser,
  emailVerification,
  forgotPassword,
  resetPassword,
  authenticateOauthUser,
  verifyToken,
  reactivateAccount,
} = require("../controllers/authControllers");


//const { authenticate } = require("../middleware/auth");

const {
  ValidateUserAccountByEmail,
  ValidateUserEmailIsVerified,
} = require("../middleware/user");

const catchAsync = require("../utils/catchAsync");


// LOCAL AUTH
router.post("/signup",  signUpUser);
router.get("/verify_email/:emailVerificationToken", emailVerification);

router.post(
  "/signin",
  catchAsync(ValidateUserAccountByEmail),
  catchAsync(ValidateUserEmailIsVerified),
  signInUser
);

module.exports = router;
