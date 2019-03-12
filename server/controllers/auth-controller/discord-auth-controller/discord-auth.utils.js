const buildDiscordLoginLink = (state, env) => {
  const { DOMAIN, DISCORD_CLIENT_ID } = env;

  if (!DOMAIN || !DISCORD_CLIENT_ID) {
    throw new Error('Requires DOMAIN and DISCORD_CLIENT_ID env vars');
  }

  let loginLink = 'https://discordapp.com/api/oauth2/authorize';
  loginLink += `?client_id=${DISCORD_CLIENT_ID}`;
  loginLink += `&redirect_uri=${DOMAIN}/auth/discord/success`;
  loginLink += `&state=${state}`;
  loginLink += '&scope=identify';
  loginLink += '&response_type=code';

  return loginLink;
};

module.exports = {
  buildDiscordLoginLink,
};
