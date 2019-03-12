const {
  signAuthToken,
  verifyAuthToken,
  clearFortifiedCookie,
  setFortifiedCookie,
} = require('./auth.utils');

/**
 * Verifies the URL state against the server cookie state
 * - success: calls next() and clears state cookie
 * @returns 401 response if state verification fails
 */
const verifyStates = (req, res, next) => {
  const {
    query,
    signedCookies,
    context: { env },
  } = req;

  if (signedCookies.state !== query.state) {
    return res.sendStatus(401);
  }
  // on success: clear state cookie
  clearFortifiedCookie(req, res, 'state');
  next();
};

// TODO: docs and tests
const extractAuthToken = (req, res, next) => {
  const {
    context: { env },
    signedCookies: { token },
  } = req;

  const authToken = verifyAuthToken(token, env);
  if (!authToken) {
    return res.sendStatus(401);
  }

  req.context.authToken = authToken;
  next();
};

// TODO: tests
/**
 * Signs an auth token and attaches it in a fortified cookie
 * - JWT shape: { sub, iss, exp, registrations }
 * - cookie shape: token=JWT
 * @param {object} req.context.env environment variables
 * @param {object} req.context.authPayload { sub, registrations }
 */
const attachAuthCookie = (req, res, next) => {
  const { env, authPayload } = req.context;
  const authToken = signAuthToken(authPayload, env);

  setFortifiedCookie(res, 'token', authToken, {
    env,
    httpOnly: false,
    expiresIn: 7 * 24 * 60 * 1000,
  });
  next();
};

module.exports = {
  verifyStates,
  extractAuthToken,
  attachAuthCookie,
};
