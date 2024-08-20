const jwt = require("jsonwebtoken");

exports.getSignedToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.verifySignedToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err); // If verification fails, reject the Promise with the error
      } else {
        resolve(decoded.id); // If verification succeeds, resolve the Promise with decoded.id
      }
    });
  });
};