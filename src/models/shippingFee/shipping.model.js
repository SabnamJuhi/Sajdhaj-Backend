// models/settings/shipping.model.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

class ShippingSetting extends Model {}

ShippingSetting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50,
      comment: "Static shipping fee for all orders",
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Admin user ID who last updated",
    },
  },
  {
    sequelize,
    modelName: "ShippingSetting",
    tableName: "shipping_settings",
    timestamps: true,
  }
);

module.exports = ShippingSetting;