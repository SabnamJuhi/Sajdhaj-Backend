// models/banner/occasionalBanner.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const OccasionalBanner = sequelize.define(
  "OccasionalBanner",
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

    // Occasional-specific fields
    occasionType: { 
      type: DataTypes.TEXT,
      allowNull: true 
    },
    startDate: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    endDate: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    discountPercentage: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "occasional_banners",
    timestamps: true,
  }
);

module.exports = OccasionalBanner;