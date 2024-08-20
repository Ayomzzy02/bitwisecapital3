const mongoose = require("mongoose");
require("dotenv").config();


const connectDB = async (mongoURL) => {
  try {
    await mongoose.connect(mongoURL);
    console.log("DB Connected");
  } catch (error) {
    console.log(error, `Failed to connect to DB`);
  }
};

module.exports = { connectDB };