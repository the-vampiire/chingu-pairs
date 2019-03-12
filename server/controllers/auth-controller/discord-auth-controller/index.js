const DiscordAuthController = require('express').Router();

const { successHandler } = require('../auth.handlers');
const { loginViewHandler } = require('./discord-auth.handlers');

const {
  verifyStates,
  extractAuthToken,
  attachAuthCookie,
} = require('../auth.middleware');

const {
  updateUser,
  getDiscordUserData,
  getDiscordAccessToken,
  flagRegistrationStatus,
} = require('./discord-auth.middleware');

DiscordAuthController.get('/', loginViewHandler);

DiscordAuthController.get(
  '/success',
  verifyStates,
  getDiscordAccessToken,
  getDiscordUserData,
  extractAuthToken,
  updateUser,
  flagRegistrationStatus,
  attachAuthCookie,
  successHandler,
);

module.exports = DiscordAuthController;
