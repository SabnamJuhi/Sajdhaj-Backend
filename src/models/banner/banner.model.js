// const { DataTypes } = require("sequelize");
// const sequelize = require("../../config/db");

// const Banner = sequelize.define(
//   "Banner",
//   {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

//     imageUrl: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },

//     title: { type: DataTypes.STRING, allowNull: false },
//     subtitle: { type: DataTypes.TEXT, allowNull: false },
//     description: { type: DataTypes.TEXT, allowNull: true },
//     cta: { type: DataTypes.STRING, allowNull: false },
//     link: { type: DataTypes.STRING, allowNull: false },

//     isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
//   },
//   {
//     tableName: "banners",
//     timestamps: true,
//   }
// );

// module.exports = Banner;

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Banner = sequelize.define(
  "Banner",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subtitle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    cta: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // homepage / sidebar
    bannerPosition: {
      type: DataTypes.ENUM("homepage", "sidebar"),
      defaultValue: "homepage",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "banners",
    timestamps: true,
  },
);

module.exports = Banner;
