const methods = require('./methods');
const { loadExternalMethods } = require('sequelize-external-methods');

module.exports = (sequelize, DataTypes) => {
  const GithubData = sequelize.define('GithubData', {
    github_id: {
      unique: true,
      type: DataTypes.INTEGER,
    },

    email: {
      unique: true,
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
  });

  GithubData.associate = (models) => {
    GithubData.belongsTo(models.User);
  };

  loadExternalMethods(GithubData, methods);

  return GithubData;
};
