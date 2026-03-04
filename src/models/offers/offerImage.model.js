// models/offers/offerImage.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const OfferImage = sequelize.define(
  "OfferImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    offerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'offers',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    imageType: {
      type: DataTypes.ENUM('banner', 'mobile_banner', 'thumbnail', 'card', 'promo', 'background'),
      allowNull: false,
      defaultValue: 'banner',
      comment: 'Type of image for different display purposes'
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    altText: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "offer_images",
    timestamps: true,
  }
);

module.exports = OfferImage;