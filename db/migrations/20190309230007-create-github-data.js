'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('github_data', {
      github_id: {
        unique: true,
        type: Sequelize.INTEGER,
      },

      email: {
        unique: true,
        type: Sequelize.STRING,
      },
    }),

  down: queryInterface => queryInterface.dropTable('github_data'),
};
