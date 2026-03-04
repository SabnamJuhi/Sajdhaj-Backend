// models/offers/subOfferImage.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const SubOfferImage = sequelize.define(
  "SubOfferImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subOfferId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'offer_subs',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    imageType: {
      type: DataTypes.ENUM('badge', 'icon', 'background', 'promo', 'brand_logo'),
      allowNull: false,
      defaultValue: 'badge',
      comment: 'Type of image for sub-offer display'
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
  },
  {
    tableName: "sub_offer_images",
    timestamps: true,
  }
);

module.exports = SubOfferImage;