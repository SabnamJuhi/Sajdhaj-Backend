// const { Model, DataTypes } = require("sequelize");
// const sequelize = require("../../config/db");

// class OrderItem extends Model {}

// OrderItem.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     orderId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     productId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     productName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     quantity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     priceAtPurchase: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//     totalPrice: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//     variantId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     sizeId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     variantInfo: {
//       type: DataTypes.JSON, // To store { "color": "Red", "size": "XL" }
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: "OrderItem",
//     tableName: "order_items",
//   },
// );

// module.exports = OrderItem;




const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    // Quantity
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Variant Details
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sizeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    variantInfo: {
      type: DataTypes.JSON, // To store { "color": "Red", "size": "XL" }
      allowNull: true,
    },

    // NEW FIELDS - Base Pricing
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "MRP per unit",
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Selling price per unit",
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Base discount percentage",
    },

    // NEW FIELDS - Totals with Quantity
    totalMrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "mrp × quantity",
    },
    totalSellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "sellingPrice × quantity",
    },

    // NEW FIELDS - Offer Details
    offerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subOfferId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    offerDiscountType: {
      type: DataTypes.ENUM("PERCENTAGE", "FLAT"),
      allowNull: true,
    },
    offerDiscountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    offerDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // NEW FIELD - Total Discount
    totalDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // NEW FIELD - Price After Offer
    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "totalSellingPrice - offerDiscountAmount",
    },

    // NEW FIELD - Offer Applied Flag
    offerApplied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // // EXISTING FIELDS (keeping for backward compatibility)
    // priceAtPurchase: {
    //   type: DataTypes.DECIMAL(10, 2),
    //   allowNull: false,
    // },
    // totalPrice: {
    //   type: DataTypes.DECIMAL(10, 2),
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: true, // Added timestamps
  },
);

module.exports = OrderItem;