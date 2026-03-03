// models/cartCoupon.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const CartCoupon = sequelize.define(
  "CartCoupon",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER, // ✅ MATCHES Users.id
      allowNull: false,
    },

    couponId: {
      type: DataTypes.INTEGER, // ⚠️ Make sure Coupons.id is also INT
      allowNull: false,
    },

    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "cart_coupons",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId"], // one coupon per user
      },
    ],
  }
);

module.exports = CartCoupon;