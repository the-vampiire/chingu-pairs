
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const enums = require('../../db/enums');
const models = require('../../db/models');

const injectContext = (context) => (req, _, next) => {
  req.context = context;
  next();
}

module.exports = (env = {}) => ({
  customMiddleware: {
    injectContext,
  },

  appMiddleware: [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: false }),
    cookieParser(env.COOKIE_SECRET),
    injectContext({ env, models, enums }),
  ],
});