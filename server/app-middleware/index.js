
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const models = require('../../db/models');


module.exports = (env) => {
  const injectContext = (context) => (req, _, next) => {
    req.context = context;
    next();
  }

  return {
    customMiddleware: {
      injectContext,
    },

    appMiddleware: [
      bodyParser.json(),
      bodyParser.urlencoded({ extended: false }),
      cookieParser(env.COOKIE_SECRET),
      injectContext({ env, models }),
    ],
  }
}