const { buildCookieOptions, clearFortifiedCookie } = require('../auth-controller/auth.utils');

const validatePayload = (req, res, next) => {
  const expectedFields = [
    'csrf_token',
    'skill_level',
    'availability',
    'timezone',
  ];

  const hasValidFields = expectedFields.every(
    // fields are present && not empty
    field => field !== undefined && field.length > 0,
  );

  if (!hasValidFields) {
    return res.sendStatus(400);
  }

  next();
};

const verifyCSRFToken = (req, res, next) => {
  const {
    body,
    signedCookies,
    context: { env },
  } = req;

  if (
    !signedCookies.csrf_token || // ensure CSRF token cookie is present
    body.csrf_token !== signedCookies.csrf_token // ensure they match
  ) {
    return res.sendStatus(401);
  }

  clearFortifiedCookie(req, res, 'csrf_token');
  next();
};

const updateUser = async (req, res, next) => {
  const { authToken, models } = req.context;
  const { skill_level, availability, timezone } = req.body;

  const userID = authToken.sub;
  const user = await models.User.findByPk(userID);
  if (!user) {
    // no User, send to Github Login (registration entry point)
    return res.redirect('/auth/github');
  }

  await user.update({ skill_level, availability, timezone });
  next();
};

const flagRegistrationStatus = (req, _, next) => {
  const { sub, registrations } = req.context.authToken;

  const authPayload = {
    sub,
    registrations: { ...registrations, service: true },
  };

  req.context.authPayload = authPayload;
  next();
};

module.exports = {
  updateUser,
  validatePayload,
  verifyCSRFToken,
  flagRegistrationStatus,
};
