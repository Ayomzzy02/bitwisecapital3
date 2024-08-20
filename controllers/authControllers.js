const crypto = require("crypto");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");

const AppError = require("../utils/appError");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const {
  emailSender: sendEmail,
  sendVerificationEmail,
} = require("../utils/email");

const {
  generateResetPasswordHTML,
  generateResetPasswordSuccessHTML,
} = require("../utils/emailTemplate");

const { getSignedToken, verifySignedToken } = require("../services/jwt");

const authenticateResponse = async function (
  user,
  statusCode,
  res
) {
  const token = getSignedToken(user._id);
  user.password = undefined; // so the password won't be part of the output
  if (user.profilePhoto) {
    const signedUrl = await getProfileImageUrl(user.profilePhoto);
    user.profilePhoto = signedUrl
  }

  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};



exports.signUpUser = catchAsync(async (req, res, next) => {
  try {
    const { fullName, userName, email, phone, password } = req.body;
  
  const checkUser = await User.findOne({ email });
  if (checkUser) {
    return next(new AppError("User with email already exists.", 400));
  }

  const user = await User.create({
    fullName: fullName,
    userName: userName,
    email: email,
    phone: phone,
    password: password,
  });

  await sendVerificationEmail(user);
  
  return res.status(201).json({
    status: "success",
    message: `Almost done, ${user.fullName}. A verification email has been sent to the email address provided.`,
  });
  } catch(error) {
    return next(new AppError(`Internal Server Error: ${error}`, 500));
  }
});

exports.signInUser = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  // Finds user and compare password
  const user = req.user;
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Password not correct!", 401));
  }
  
    authenticateResponse(user, 200, res);
});

exports.emailVerification = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const { emailVerificationToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiresIn: { $gt: Date.now() }, // this confirms that the token hasn't expired
  });

  // 2) If token has expired
  if (!user) {
    return next(
      new AppError(
        "Email verification link is invalid or has expired. Try sign up again to get a fresh link.",
        400
      )
    );
  }
  // 3) Update emailIsVerified to true
  user.emailIsVerified = true;
  await user.save({ validateModifiedOnly: true });

  return res.status(200).json({
    status: "success",
    message: `Email verification successful. Please proceed to signin.`,
  });
});