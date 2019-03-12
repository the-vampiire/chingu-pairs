const { loadExternalMethods } = require('sequelize-external-methods');

const methods = require('./methods');
const { timezones, availabilities, skillLevels } = require('../../enums');

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
      values: skillLevels.map(skillLevel => skillLevel.value),
    },

    availability: {
      allowNull: true,
      type: DataTypes.ENUM,
      values: availabilities.map(availability => availability.value),
    },

    timezone: {
      allowNull: true,
      type: DataTypes.ENUM,
      values: timezones.map(timezone => timezone.value),
    }
  });

  loadExternalMethods(User, methods);

  return User;
};
