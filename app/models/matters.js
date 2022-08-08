'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Matters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Matters.init({
    matter_number: DataTypes.INTEGER,
    cfa_signed: DataTypes.BOOLEAN,
    statement_of_claim_filed: DataTypes.BOOLEAN,
    s_of_c_served: DataTypes.BOOLEAN,
    s_of_d_served: DataTypes.BOOLEAN,
    aff_of_recs_served: DataTypes.BOOLEAN,
    producibles_sent: DataTypes.BOOLEAN,
    questioning_done: DataTypes.BOOLEAN,
    undertakings_remaining: DataTypes.INTEGER,
    notes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Matters',
  });
  return Matters;
};