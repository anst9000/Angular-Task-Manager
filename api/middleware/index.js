const jwt = require("jsonwebtoken");
const { List, Task, User } = require("../models");

/**
 * ====================================
 * MIDDLEWARE CORS OPTIONS
 * ====================================
 */
const allowedOrigins = [
  "http://localhost:4200",
  // "http://localhost:4200/login",
  // "http://localhost:4200/lists/:id",
];

const allowedMethods = [
  "GET",
  "POST",
  "HEAD",
  "OPTIONS",
  "PUT",
  "PATCH",
  "DELETE",
];

const allowedHeaders = [
  "Origin",
  "X-Requested-With",
  "Content-Type",
  "Accept",
  "x-access-token",
  "x-refresh-token",
  "_id",
];

const exposedHeaders = ["x-access-token", "x-refresh-token"];

const corsOptions = {
  origin: allowedOrigins,
  methods: allowedMethods,
  allowedHeaders: allowedHeaders,
  exposedHeaders: exposedHeaders,
  optionsSuccessStatus: 200,
};

/**
 * ====================================
 * MIDDLEWARE AUTHENTICATION
 * ====================================
 */
// Check if req has valid JWT access token
const authenticate = (req, res, next) => {
  const token = req.header("x-access-token");

  // Verify the JWT
  jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
    if (err) {
      // JWT is invalid - do not authenticate
      res.status(401).send(err);
    } else {
      // JWT is valid
      req.user_id = decoded._id;
      next();
    }
  });
};

// Verify refresh token middleware
const verifySession = (req, res, next) => {
  let refreshToken = req.header("x-refresh-token");
  let _id = req.header("_id");

  User.findByIdAndToken(_id, refreshToken)
    .then((user) => {
      if (!user) {
        // User couldn't be found
        return Promise.reject({
          error:
            "User not found. Make sure that the refresh token and user id are correct",
        });
      }

      // The user was found - therefor the refresh token exists in the database
      req.user_id = user._id;
      req.userObject = user;
      req.refreshToken = refreshToken;

      let isSessionValid = false;

      user.sessions.forEach((session) => {
        if (session.token === refreshToken) {
          // Check if the session has expired
          if (!User.hasRefreshTokenExpired(session.expiresAt)) {
            // Refresh token has not expired
            isSessionValid = true;
          }
        }
      });

      if (isSessionValid) {
        // the session is valid, call next() to continue with the web request
        next();
      } else {
        // The session is not valid
        return Promise.reject({
          error: "Refresh token has expired or the session is invalid.",
        });
      }
    })
    .catch((e) => res.status(401).send(e));
};

module.exports = {
  authenticate,
  verifySession,
  corsOptions,
};
