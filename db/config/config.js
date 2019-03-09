const env = process.env.NODE_ENV
  ? process.env
  : require('dotenv').config().parsed;

const profile = {
  database: env.DB_NAME,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'postgres',
  define: {
    underscored: true,
    underscoredAll: true,
  },
  logging: env.NODE_ENV === 'production',
};

module.exports = {
  test: profile,
  development: profile,
  production: profile,
};
