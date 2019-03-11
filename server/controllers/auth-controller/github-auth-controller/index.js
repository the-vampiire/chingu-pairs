const express =  require('express');

const { verifyStates, attachAuthCookie } = require('../auth.middleware');
const { loginViewHandler, successHandler } = require('./github-auth.handlers');
const {
  getGithubAccessToken,
  getGithubUserData,
  flagRegistrationStatus,
} = require('./github-auth.middleware');

// controls: /auth/
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
