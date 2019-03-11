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
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      discord_id: {
        unique: true,
        allowNull: true,
        type: Sequelize.INTEGER,
      },

      rank: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },

      availability: {
        allowNull: true,
        type: Sequelize.ENUM,
        values: ['any', 'morning', 'night'],
      },

      timezone: {
        allowNull: true,
        type: Sequelize.ENUM,
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
    }),

  down: queryInterface => queryInterface.dropTable('users'),
};
