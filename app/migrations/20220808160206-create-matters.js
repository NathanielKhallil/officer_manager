"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Matters", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      matter_number: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
      },
      cfa_signed: {
        type: Sequelize.BOOLEAN,
      },
      statement_of_claim_filed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      s_of_c_served: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      s_of_d_served: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      aff_of_recs_served: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      producibles_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      questioning_done: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      undertakings_remaining: {
        type: Sequelize.INTEGER,
      },
      notes: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Matters");
  },
};
