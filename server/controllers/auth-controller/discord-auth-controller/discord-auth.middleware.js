const axios = require('axios');
const qs = require('querystring');

const discordRequest = axios.create({
  baseURL: 'https://discordapp.com/api/',
});

const getDiscordAccessToken = async (req, res, next) => {
  const {
    query: { code },
    context: { env },
  } = req;
  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DOMAIN } = env;

  const urlEncodedPayload = qs.stringify({
    code,
    scope: 'identify',
    grant_type: 'authorization_code',
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    redirect_uri: `${DOMAIN}/auth/discord/success`,
  });

  let response;
  try {
    response = await discordRequest.post('/oauth2/token', urlEncodedPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  } catch (error) {
    console.error(error.response.data);
    return res.sendStatus(401);
  }

  req.context.access_token = response.data.access_token;
  next();
};

const getDiscordUserData = async (req, res, next) => {
  const { access_token } = req.context;

  let response;
  try {
    response = await discordRequest.get('/users/@me', {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(401);
  }

  req.context.discord_id = response.data.id;
  next();
};

const updateUser = async (req, res, next) => {
  const { authToken, models, discord_id } = req.context;

  const userID = authToken.sub;
  const user = await models.User.findByPk(userID);
  if (!user) {
    return res.redirect('/auth/github');
  }

  await user.update({ discord_id });
  next();
};

const flagRegistrationStatus = (req, _, next) => {
  const { sub, registrations } = req.context.authToken;

  const authPayload = {
    sub,
    registrations: { ...registrations, discord: true },
  };

  req.context.authPayload = authPayload;
  next();
};

module.exports = {
  updateUser,
  getDiscordUserData,
  getDiscordAccessToken,
  flagRegistrationStatus,
};
