const axios = require('axios');
const jwt = require('jsonwebtoken');

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

  req.context.access_token = response.data.access_token;
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

  req.context.githubUserData = {
    email,
    github_id: response.data.id,
    username: response.data.login,
  };
  next();
};

/**
 * Builds User auth token payload with User data an registration statuses
 * - injects req.context.authPayload and calls next()
 * - authPayload: { registrations: { discord, github, service }, sub: <User ID> }
 * @param {object} req.context.models DB models
 * @param {object} req.context.githubUserData GitHub User data
 */
const flagRegistrationStatus = async (req, _, next) => {
  const { models, githubUserData } = req.context;

  // every time user logs in
  const authPayload = {
    sub: null, // sub holds User ID
    registrations: { discord: false, github: false, service: false },
  };

  let githubData;
  try {
    [githubData] = await models.GithubData.findOrCreate({
      attributes: [], // no github data needed
      where: { ...githubUserData }, // idea: what if primary email or username on GitHub have changed?
      include: [
        { required: false, model: 'User', attributes: ['id', 'discord_id'] },
      ],
    });

    // if await succeeds mark github registration complete
    registrationStatus.github = true;
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  if (githubData.User) {
    // User entry has been made, mark service registration complete
    registrationStatus.service = true;
    // set sub (JWT subject) ID to the User ID
    registrationStatus.sub = githubData.User.id;

    if (githubData.User.discord_id) {
      // if User.discord_id is not null mark discord registration complete
      registrationStatus.discord = true;
    }
  }

  req.context.authPayload = authPayload;
  next();
};

// TODO: docs and tests
const signAuthToken = (req, _, next) => {
  const { env, authPayload } = req.context;

  const tokenOptions = {
    issuer: env.DOMAIN,
    expiresIn: env.AUTH_TOKEN_EXP,
  };

  req.context.authToken = jwt.sign(
    authPayload,
    env.AUTH_TOKEN_SECRET,
    tokenOptions
  );
  next();
};

module.exports = {
  getGithubAccessToken,
  getGithubUserData,
  flagRegistrationStatus,
  signAuthToken,
};
