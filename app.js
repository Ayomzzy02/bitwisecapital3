const express = require("express");
const cors = require("cors");

const AuthRoute = require("./routes/authRoute");
const globalErrorMiddleware = require("./controllers/errorControllers");
const AppError = require("./utils/appError");

const app = express();

// Configuring CORS

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
// Enabling CORS Pre-Flight
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Middlewares

// - Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res, next) => {
  return res.status(200).json({
    status: "success",
    message: "Welcome to CryptoBack API.",
  });
});

app.use(`${process.env.API_BASE_URL}/auth`, AuthRoute);

// Any request that makes it to this part has lost it's way
app.all("*", (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});



// Global Error Handling middleware
app.use(globalErrorMiddleware);

module.exports = app;
