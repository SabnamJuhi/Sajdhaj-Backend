// models/banner/collectionBanner.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const CollectionBanner = sequelize.define(
  "CollectionBanner",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    cta: { type: DataTypes.STRING, allowNull: false },
    link: { type: DataTypes.STRING, allowNull: false },

    // Collection-specific fields
    collectionType: { 
      type: DataTypes.TEXT,
      allowNull: true 
    },
    productCount: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "collection_banners",
    timestamps: true,
  }
);

module.exports = CollectionBanner;