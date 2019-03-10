const path = require('path');
const express = require('express');

const { AuthController } = require('./controllers');

module.exports = env => {
  const { appMiddleware } = require('./app-middleware')(env);

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(...appMiddleware);
  app.use(express.static(`${__dirname}/public`));
  app.use('/styles', express.static(`${__dirname}/public`));

  app.use('/auth', AuthController);

  return app;
};
