const methods = require('./methods');
const { loadExternalMethods } = require('sequelize-external-methods');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING,
    },

    email: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },

    github_id: {
      unique: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    discord_id: {
      unique: true,
      allowNull: true,
      type: DataTypes.INTEGER,
    },

    skill_level: {
      allowNull: true,
      type: DataTypes.ENUM,
      values: ['vanilla', 'frontend', 'fullstack'],
    },

    availability: {
      allowNull: true,
      type: DataTypes.ENUM,
      values: ['any', 'morning', 'night'],
    },

    timezone: {
      allowNull: true,
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

  loadExternalMethods(User, methods);

  return User;
};
