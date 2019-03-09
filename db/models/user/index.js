const methods = require('./methods');
const { loadExternalMethods } = require('sequelize-external-methods');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    discord_id: {
      unique: true,
      type: DataTypes.INTEGER,
    },

    username: {
      unique: true,
      type: DataTypes.STRING,
    },

    rank: {
      type: DataTypes.INTEGER,
    },

    availability: {
      type: DataTypes.ENUM,
      values: ['any', 'morning', 'night'],
    },

    timezone: {
      type: DataTypes.ENUM,
      values: [
        -11,
        -10,
        -9,
        -8,
        -7,
        -6,
        -5,
        -4,
        -3,
        -2,
        -1,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
      ],
    },
  });

  User.associate = (models) => {
    User.hasOne(models.GithubData);
  }

  loadExternalMethods(User, methods);

  return User;
};
