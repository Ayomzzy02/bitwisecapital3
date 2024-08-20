const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
        type: String,
        required: true
    },

    userName: {
      type: String,
      required: true
    },

    password: {
      type: String,
      select: false, // this field (password) won't be part of the document fields when queried.
      required: true
  },

  email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true
  },

  
  phone: {
    type: String,
  },

  address: {
    type: String
  },

  active: {
    type: Boolean,
    select: false,
    default: true,
  },
  
  emailIsVerified: {
    type: Boolean,
    select: true,
    default: false,
  },
    
    passwordModifiedAt: { type: Date },
    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date,
    emailVerificationToken: String,
    emailVerificationTokenExpiresIn: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Query /find/ middleware/hook
userSchema.pre(/^find(?!One)/, async function () {
  this.find({ active: { $ne: false } });
});

// Document pre save middleware/hook
userSchema.pre("save", async function (next) {
  // If password path/field is unmodified (create or save) returns
  if (!this.isModified("password")) return next();
  // Salts and Hashes the password
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  next();
});

// Update the passwordModifiedAt after password change

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordModifiedAt = Date.now() - 1000; // setting it to 1 sec in the past cause the actual saving might happen after jwt is issued
  next();
});
// All documents created from this schema would have access to these methods

userSchema.methods.correctPassword = async function (
  enteredPassword,
  userHashedPassword
) {
  return await bcrypt.compare(enteredPassword, userHashedPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTIATTimeStamp) {
  if (this.passwordModifiedAt) {
    const passwordModifiedAtTimeStamp = parseInt(
      this.passwordModifiedAt.getTime() / 1000,
      10
    );
    // console.log(JWTIATTimeStamp, passwordModifiedAtTimeStamp);
    return JWTIATTimeStamp < passwordModifiedAtTimeStamp;
  }
  return false;
};

// Generates password reset token

userSchema.methods.genResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Generates email verification token

userSchema.methods.genEmailVerificationToken = function () {
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");
  this.emailVerificationTokenExpiresIn = Date.now() + 60 * 60 * 1000; // An hour
  return emailVerificationToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;