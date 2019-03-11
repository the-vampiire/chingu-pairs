const axios = require('axios');

/**
 * Gets the GitHub User's primary email address
 * - calls the /user/emails GitHub API endpoint
 * @param {string} access_token GitHub User access token
 * @returns {string} primary email address on success
 * @returns {null} null on access failure
 * @returns {null} null if no primary email address is listed
 */
const getGithubPrimaryEmail = async (access_token) => {
  let response;
  try {
    response = await axios.get('https://api.github.com/user/emails', {
      headers: { authorization: `Bearer ${access_token}`},
    });
  } catch(error) {
    console.error(error);
    return null;
  }

  const primaryEmailData = response.data.find(emailData => emailData.primary);
  return primaryEmailData ? primaryEmailData.email : null;
};

/**
 * Builds a GitHub OAuth login URL used to initiate authorization
 * @param {string} state random state parameter
 * @param {object} env environment variables
 * @param {string} env.DOMAIN local server domain 
 * @param {string} env.GITHUB_CLIENT_ID client ID for OAuth flow
 * @throws {Error} if env vars are undefined
 * @returns {string} a fully formed GitHub OAuth login URL
 */
const buildGithubLoginLink = (state, env) => {
  const { DOMAIN, GITHUB_CLIENT_ID } = env;

  if (!DOMAIN || !GITHUB_CLIENT_ID) {
    throw new Error('Requires DOMAIN and GITHUB_CLIENT_ID env vars');
  }

  let loginLink = 'https://github.com/login/oauth/authorize';
  loginLink += `?client_id=${GITHUB_CLIENT_ID}`;
  loginLink += `&redirect_uri=${DOMAIN}/auth/github/success`;
  loginLink += `&state=${state}`;

  return loginLink;
};

module.exports = {
  buildGithubLoginLink,
  getGithubPrimaryEmail,
}
