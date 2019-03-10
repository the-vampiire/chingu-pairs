const express =  require('express');

const { verifyStates } = require('../auth.middleware');
const { loginViewHandler, successHandler } = require('./github-auth.handlers');
const {
  getGithubAccessToken,
  getGithubUserData,
  flagRegistrationStatus,
  signAuthToken,
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
  signAuthToken,
  successHandler,
);

module.exports = GithubAuthController;
