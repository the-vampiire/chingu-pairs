const { buildDiscordLoginLink } = require('./discord-auth.utils');
const { generateState, setFortifiedCookie } = require('../auth.utils');

// TODO: docs and tests
const loginViewHandler = (req, res) => {
  const { env } = req.context;

  const state = generateState();
  const loginLink = buildDiscordLoginLink(state, env);

  setFortifiedCookie(res, 'state', state, {
    env,
    path: '/auth/discord/success',
  });

  return res.render('auth', {
    loginLink,
    title: 'Discord Auth',
    imagePath: '/images/octo-walk.gif', // TODO: discord gif
    buttonText: 'Login with Discord',
  });
};

module.exports = {
  loginViewHandler,
};
