'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('users', {
      discord_id: {
        unique: true,
        type: Sequelize.INTEGER,
      },

      username: {
        unique: true,
        type: Sequelize.STRING,
      },

      rank: {
        type: Sequelize.INTEGER,
      },

      availability: {
        type: Sequelize.ENUM,
        values: ['any', 'morning', 'night'],
      },

      timezone: {
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
