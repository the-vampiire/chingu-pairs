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
 * - flags: signed, httpOnly, sameSite, path, 10 min expiration
 * @param {string} cookiePath [default: /] the path this cookie is accepted at
 */
const buildCookieOptions = cookiePath => ({
  signed: true,
  secure: true, // TODO: have to configure TLS on container / proxy
  httpOnly: true,
  sameSite: true,
  path: cookiePath || '/',
  expires: new Date(Date.now() + 60 * 10 * 1000), // 10 mins expiration
});

/**
 * Sets a fortified cookie in the login view response to prevent CSRF
 * - attaches the cookie to the response
 * @param {Response} res Response object
 * @param {string} cookieName name of the cookie
 * @param {string} cookieData value of the cookie
 * @param {string} cookiePath the path this cookie is accepted at
 */
const setFortifiedCookie = (res, cookieName, cookieData, cookiePath) => {
  const cookieOptions = buildCookieOptions(cookiePath);
  res.cookie(cookieName, cookieData, cookieOptions);
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
  const { github, discord, service } = authPayload;

  if (!github) return '/auth';
  if (!service) return `${CLIENT_DOMAIN}/register`;
  if (!discord) return '/auth/discord';
  return CLIENT_DOMAIN;
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

  return jwt.sign(
    authPayload,
    env.AUTH_TOKEN_SECRET,
    tokenOptions,
  );
}

// TODO: docs and tests
const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, env.AUTH_TOKEN_SECRET, { issuer: env.DOMAIN });
  } catch(error) {
    return null;
  }
}

module.exports = {
  generateState,
  signAuthToken,
  verifyAuthToken,
  buildAuthRedirect,
  setFortifiedCookie,
  buildCookieOptions,
};
