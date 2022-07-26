"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.bulkInsert("Users", [
      {
        username: "Josh",
        email: "josh@hirejoshfrank.com",
        password: "1234",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete("Users", null, {});
  },
};
