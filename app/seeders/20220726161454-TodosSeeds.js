"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert("Todos", [
      {
        title: "matter ####",
        content: "undertakings",
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "matter ####",
        content: "affidavit of blank",
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete("Todos", null, {});
  },
};
