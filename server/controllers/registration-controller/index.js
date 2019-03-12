const RegistrationController = require('express').Router();

const { registrationViewHandler } = require('./registration.handlers');
const { successHandler } = require('../auth-controller/auth.handlers');
const { extractAuthToken, attachAuthCookie } = require('../auth-controller/auth.middleware');
const {
  updateUser,
  validatePayload,
  verifyCSRFToken,
  flagRegistrationStatus,
} = require('./registration.middleware');

RegistrationController.get('/', registrationViewHandler);

RegistrationController.post(
  '/',
  validatePayload,
  verifyCSRFToken,
  extractAuthToken,
  updateUser,
  flagRegistrationStatus,
  attachAuthCookie,
  successHandler,
);

module.exports = RegistrationController;
