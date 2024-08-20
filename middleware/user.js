const User = require("../models/User");
const AppError = require("../utils/appError");
const { sendVerificationEmail } = require("../utils/email");

class UserMiddleware {
  static async ValidateUserAccountByEmail(req, _res, next) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password +authType"
      );
      if (user) {
        req.user = user;
        return next();
      }
      return next(new AppError("User with email does not existed.", 400));
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  }
  static async ValidateUserEmailIsVerified(req, _res, next) {
    const user = req.user;
    if (!user.emailIsVerified) {
      await sendVerificationEmail(user);
      return next(
        new AppError(
          "Email not verified. Please check your inbox for a verification mail.",
          401
        )
      );
    }

    return next();
  }
}

module.exports = UserMiddleware;
