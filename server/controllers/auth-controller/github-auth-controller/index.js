const express =  require('express');

const { successHandler } = require('../auth.handlers');
const { loginViewHandler } = require('./github-auth.handlers');
const { verifyStates, attachAuthCookie } = require('../auth.middleware');
const {
  getGithubAccessToken,
  getGithubUserData,
  flagRegistrationStatus,
} = require('./github-auth.middleware');

const GithubAuthController = express.Router();

GithubAuthController.get('/', loginViewHandler);

GithubAuthController.get(
  '/success',
  verifyStates,
  getGithubAccessToken,
  getGithubUserData,
  flagRegistrationStatus,
  attachAuthCookie,
  successHandler,
);

module.exports = GithubAuthController;
