"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "Users",
      "access_granted",
      Sequelize.BOOLEAN
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Users", "access_granted");
  },
};
