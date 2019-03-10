const AuthController = require('express').Router();

const GithubAuthController = require('./github-auth-controller');
const DiscordAuthController = require('./discord-auth-controller');

AuthController.use('/github', GithubAuthController);
AuthController.use('/discord', DiscordAuthController);

module.exports = AuthController;
