const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Load in the mongoose models
const { User } = require("../models");

// Load in middleware
const { authenticate, verifySession } = require("../middleware");

/**
 * ====================================
 * ROUTES FOR USER
 * ====================================
 */
// @route   POST /users
// @desc    Create a new user (= signup)
// @access  Public
router.post("/", (req, res) => {
  // User sign up
  let body = req.body;
  let newUser = new User(body);

  newUser
    .save()
    .then(() => {
      return newUser.createSession();
    })
    .then((refreshToken) => {
      // Session created successfully
      // Generate an access token for user
      return newUser.generateAccessAuthToken().then((accessToken) => {
        return { accessToken, refreshToken };
      });
    })
    .then((authTokens) => {
      // Construct and send the response to the user with thir auth tokens in the header
      // and the user object in the body
      res
        .header("x-refresh-token", authTokens.refreshToken)
        .header("x-access-token", authTokens.accessToken)
        .send(newUser);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

// @route   POST /users/login
// @desc    Login user
// @access  Public
router.post("/login", (req, res) => {
  let { email, password } = req.body;
  console.log("trying to log in");

  User.findByCredentials(email, password)
    .then((user) => {
      return user
        .createSession()
        .then((refreshToken) => {
          return user.generateAccessAuthToken().then((accessToken) => {
            return { accessToken, refreshToken };
          });
        })
        .then((authTokens) => {
          // Construct and send the response to the user with thir auth tokens in the header
          // and the user object in the body
          res
            .header("x-refresh-token", authTokens.refreshToken)
            .header("x-access-token", authTokens.accessToken)
            .send(user);
        });
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

// @route   GET /users/access-token
// @desc    Generate and return access token
// @access  Private
router.get("/me/access-token", verifySession, (req, res) => {
  // We know that the user is authenticated and we have the user_id and user available
  req.userObject
    .generateAccessAuthToken()
    .then((accessToken) => {
      res.header("x-access-token", accessToken).send({ accessToken });
    })
    .catch((e) => res.status(400).send());
});

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

module.exports = router;
