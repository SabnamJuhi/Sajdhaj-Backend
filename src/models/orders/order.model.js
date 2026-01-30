const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Order = sequelize.define("Order", {
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
    defaultValue: "pending",
  },
  paymentStatus: {
    type: DataTypes.ENUM("unpaid", "paid", "failed", "refunded"),
    defaultValue: "unpaid",
  },
  paymentMethod: {
    type: DataTypes.STRING, // e.g., 'Razorpay', 'Stripe', 'COD'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Order;