"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todos.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }
  }
  Todos.init(
    {
      title: DataTypes.STRING,
      content: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "todos",
    }
  );
  return Todos;
};
