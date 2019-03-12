const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generates a random hex string to be used as a state in GitHub OAuth flow
 * @returns {string} 64 character hex string
 */
const generateState = () => crypto.randomBytes(32).toString('hex');

// TODO: tests
/**
 * Fortified cookie options
 * - flags: signed, httpOnly, sameSite: lax, path, expiration
 *  - sets secure: true when NODE_ENV=production
 * - defaults:
 *  - httpOnly: true
 *  - path: '/' (available on all DOMAIN paths)
 *  - expiresIn: 10 * 60 * 1000 (10 minutes)
 * @param {{ env: object, path: String, expiresIn: Number, httpOnly: boolean }} options
 * @param {string} options.path the path the cookie is accepted at
 * @param {number} options.expiresIn cookie lifespan in ms
 * @param {boolean} options.httpOnly set httpOnly flag
 */
const buildCookieOptions = options => {
  const {
    env,
    path = '/',
    httpOnly = true,
    expiresIn = 10 * 60 * 1000,
  } = options;

  return {
    path,
    httpOnly,
    signed: true,
    sameSite: 'lax',
    secure: env && env.NODE_ENV === 'production',
    expires: new Date(Date.now() + expiresIn), // 10 mins expiration
  };
};

/**
 * Sets a fortified cookie in the login view response to prevent CSRF
 * - attaches the cookie to the response
 * @param {Response} res Response object
 * @param {string} cookieName name of the cookie
 * @param {string} cookieData value of the cookie
 * @param {{ env: Object, path: String, expiresIn: Number, httpOnly: boolean }} options options to override defaults
 */
const setFortifiedCookie = (res, cookieName, cookieData, options) => {
  const cookieOptions = buildCookieOptions(options);
  res.cookie(cookieName, cookieData, cookieOptions);
};

// TODO: docs and tests
const clearFortifiedCookie = (req, res, cookieName) => {
  const { env } = req.context;

  const hasSubPath = req.path !== '/';
  const path = `${req.baseUrl}${hasSubPath ? req.path : ''}`;

  const cookieOptions = buildCookieOptions({ env, path });
  delete cookieOptions.expires; // remove expiration to clear cookie

  res.clearCookie(cookieName, cookieOptions);
};

/**
 * Determines redirect location based on registration status
 * - redirects according to registration flow
 *  - github -> service -> discord
 * - ensures User is always returned to the next step towards completion
 * @param {object} authPayload { registrations, sub }
 * @param {object} env.CLIENT_DOMAIN Client URL
 * @returns {string} github incomplete: /auth
 * @returns {string} serv incomplete: <client>/register
 * @returns {string} discord incomplete: /auth/discord
 * @returns {string} registration complete: <client>
 */
const buildAuthRedirect = (authPayload, env) => {
  const { CLIENT_DOMAIN } = env;
  const { discord, service } = authPayload.registrations;

  if (!service) return '/registration';
  if (!discord) return '/auth/discord';
  return CLIENT_DOMAIN; // all complete back to client
};

// TODO: tests
/**
 * Signs a Chingu Pairs authentication token
 * - { sub, iss, exp, registrations }
 * @param {object} authPayload { sub, registrations }
 * @param {object} env environment variables
 * @returns {string} signed JWT
 */
const signAuthToken = (authPayload, env) => {
  const tokenOptions = {
    issuer: env.DOMAIN,
    expiresIn: env.AUTH_TOKEN_EXP,
  };

  return jwt.sign(authPayload, env.AUTH_TOKEN_SECRET, tokenOptions);
};

// TODO: docs and tests
const verifyAuthToken = (token, env) => {
  try {
    return jwt.verify(token, env.AUTH_TOKEN_SECRET, { issuer: env.DOMAIN });
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateState,
  signAuthToken,
  verifyAuthToken,
  buildAuthRedirect,
  setFortifiedCookie,
  clearFortifiedCookie,
  buildCookieOptions,
};
