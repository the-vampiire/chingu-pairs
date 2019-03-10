const { buildCookieOptions } = require('./auth.utils');

/**
 * Verifies the URL state against the server cookie state
 * - success: calls next() and clears state cookie
 * @returns 401 response if state verification fails
 */
const verifyStates = (req, res, next) => {
  const { signedCookies, query } = req;

  if (signedCookies.state !== query.state) {
    return res.sendStatus(401);
  }

  // on success: clear state cookie
  res.clearCookie('state', buildCookieOptions(req.path));
  next();
};

module.exports = {
  verifyStates,
};
