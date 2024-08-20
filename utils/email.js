const nodemailer = require("nodemailer");
const { generateEmailVerificationHTML } = require("./emailTemplate");

const emailSender = async function (options) {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  let mailOptions = {
    from: `"Investment" <${process.env.EMAIL_USER}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    html: options.body, // html body
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent %s", info.messageId);
};

const sendVerificationEmail = async function (user) {
  try {
    const emailVerificationToken = user.genEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    const emailVerificationURL = `http://${process.env.FRONTEND_URL}/Cryptoback2/auth/verifyEmail/${emailVerificationToken}`;
    const body = generateEmailVerificationHTML(
      user.fullName,
      emailVerificationURL
    );
    const subject = `${user.fullName}, verify your email address.`;
    await emailSender({
      email: user.email,
      subject,
      body,
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("There was an error sending the email. Try again later!");
  }
};

module.exports = { sendVerificationEmail, emailSender };
