const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

class SizeMaster extends Model {}

SizeMaster.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "SizeMaster",
    tableName: "size_masters",
  }
);

module.exports = SizeMaster;