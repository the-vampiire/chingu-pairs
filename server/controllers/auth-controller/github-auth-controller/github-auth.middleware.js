const axios = require('axios');
const { getGithubPrimaryEmail } = require('./github-auth.utils');

/**
 * Exchanges the GitHub OAuth handshake 'code' for a User access token
 * - calls the /login/oauth/access_token GitHub endpoint
 * - success: injects req.context.access_token and calls next()
 * @param req.query.code GitHub OAuth handshake code param
 * @param req.query.state GitHub OAuth random state param
 * @param req.context.env environement variables
 * @requires req.context.env variables: DOMAIN, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 * @returns 401 response if access token exchange fails
 */
const getGithubAccessToken = async (req, res, next) => {
  const { code, state } = req.query;
  const { DOMAIN, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = req.context.env;

  let response;
  try {
    response = await axios.post('https://github.com/login/oauth/access_token', {
      code,
      state,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      redirect_uri: `${DOMAIN}/auth/github/success`,
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(401);
  }
  
  // oauth app returns access token in the folowing form:
    // 'access_token=TOKEN&scope=user%3Aemail&token_type=bearer'
  req.context.access_token = response.data.split('&')[0].split('=')[1];
  next();
};

/**
 * Authenticates the GitHub User by retrieving their data using their access token
 * - calls the /user GitHub API endpoint
 * - retrieves their email using getGithubPrimaryEmail() auth util
 * - on success: injects req.context.githubUserData and calls next()
 *  - githubUserData shape: { email, username }
 * @param {string} req.context.access_token GitHub User access token
 * @returns 401 response if authentication request fails
 * @returns 401 response if primary email is not found
 */
const getGithubUserData = async (req, res, next) => {
  const { access_token } = req.context;

  let response;
  try {
    response = await axios.get('https://api.github.com/user', {
      headers: { authorization: `Bearer ${access_token}` },
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(401);
  }

  const email = await getGithubPrimaryEmail(access_token);
  if (!email) return res.sendStatus(401);

  const { id, login, avatar_url } = response.data;

  req.context.githubUserData = {
    email,
    avatar_url,
    username: login,
    github_id: String(id), // store as string to prevent large int error
  };
  next();
};

/**
 * Builds User auth token payload with User data and registration statuses
 * - uses Github data to find or create a User
 * - injects req.context.authPayload and calls next()
 *  - authPayload: { sub: <User ID>, registrations: { discord, service } }
 * @param {object} req.context.models DB models
 * @param {object} req.context.githubUserData GitHub User data
 */
const flagRegistrationStatus = async (req, _, next) => {
  const { models, githubUserData } = req.context;

  const user = await models.User.githubGetOrCreate(githubUserData);
  if (!user) {
    // error during saving new user
    return res.sendStatus(500);
  }

  req.context.authPayload = {
    sub: user.id,
    registrations: user.registrationStatus,
  };
  next();
};

module.exports = {
  getGithubAccessToken,
  getGithubUserData,
  flagRegistrationStatus,
};
