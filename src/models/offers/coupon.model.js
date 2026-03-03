const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Coupon = sequelize.define("Coupon", {
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  discountType: {
    type: DataTypes.ENUM("FLAT", "PERCENTAGE"),
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
   description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  maxDiscount: {
    type: DataTypes.FLOAT,
  },
  minCartValue: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Coupon;