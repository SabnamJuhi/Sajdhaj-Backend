const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sku: {
      type: DataTypes.VIRTUAL,
      get() {
        const categoryCode = this.Category?.code || "CAT";
        const subCode = this.SubCategory?.code || "SUB";
        const prodCatCode = this.ProductCategory?.code || "PRD";

        const paddedId = String(this.id).padStart(6, "0");

        return `${categoryCode}-${subCode}-${prodCatCode}-${paddedId}`;
      },
    },
    productType: {
      type: DataTypes.ENUM("READYMADE", "CUSTOMIZED"),
      allowNull: false,
      defaultValue: "READYMADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    subCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // productCategoryId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    description: {
      type: DataTypes.TEXT,
    },
    brandName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    badge: {
      type: DataTypes.STRING,
    },
    productCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    qrCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    wishlistCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    soldCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
  },
);

module.exports = Product;
