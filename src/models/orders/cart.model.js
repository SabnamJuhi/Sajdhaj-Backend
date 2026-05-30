// const { DataTypes } = require("sequelize");
// const sequelize = require("../../config/db");

// const CartItem = sequelize.define("CartItem", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },

//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },

//   productId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },

//   variantId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },

//   sizeId: {                     // ✅ FK instead of selectedSize
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },

//   quantity: {
//     type: DataTypes.INTEGER,
//     defaultValue: 1,
//     validate: { min: 1 },
//   },
// });

// module.exports = CartItem;






const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CartItem = sequelize.define("CartItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  variantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // For READYMADE products
  sizeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  // For CUSTOMIZED products
  customMeasurements: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
});

module.exports = CartItem;
