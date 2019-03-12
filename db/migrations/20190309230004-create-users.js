'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('users', {
      id: {
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      
      username: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
  
      email: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
      },
  
      github_id: {
        unique: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },

      discord_id: {
        unique: true,
        allowNull: true,
        type: Sequelize.INTEGER,
      },

      skill_level: {
        allowNull: true,
        type: Sequelize.STRING,

      },

      availability: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      timezone: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),

  down: queryInterface => queryInterface.dropTable('users'),
};
