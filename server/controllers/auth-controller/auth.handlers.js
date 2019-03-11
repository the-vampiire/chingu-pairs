const { buildAuthRedirect } = require('./auth.utils');

// TODO: docs and tests
const successHandler = (req, res) => {
  const { env, authPayload } = req.context;
  const redirectLocation = buildAuthRedirect(authPayload, env);

  return res.redirect(redirectLocation);
};

module.exports = {
  successHandler,
};
