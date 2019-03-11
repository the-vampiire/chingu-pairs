const { buildGithubLoginLink } = require('./github-auth.utils');
const {
  generateState,
  setFortifiedCookie,
} = require('../auth.utils');

const loginViewHandler = (req, res) => {
  const { env } = req.context;

  const state = generateState();
  const loginLink = buildGithubLoginLink(state, env);

  setFortifiedCookie(res, 'state', state, '/auth/github/success');

  return res.render('auth', {
    loginLink,
    title: 'Github Auth',
    imagePath: '/images/octo-walk.gif',
    buttonText: 'Login with Github',
  });
};

module.exports = {
  loginViewHandler,
};
