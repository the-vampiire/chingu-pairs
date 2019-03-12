const {
  generateState,
  setFortifiedCookie,
} = require('../auth-controller/auth.utils');

const registrationViewHandler = (req, res) => {
  const { env, enums } = req.context;
  const { skillLevels, availabilities, timezones } = enums;

  const csrfToken = generateState();

  setFortifiedCookie(res, 'csrf_token', csrfToken, {
    env,
    path: '/registration',
  });
  
  return res.render('registration', {
    csrfToken,
    timezones,
    skillLevels,
    availabilities,
  });
};

module.exports = {
  registrationViewHandler,
};
