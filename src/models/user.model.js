const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  userName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  googleId: { type: DataTypes.STRING, unique: true },
  mobileNumber: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: true } 
});

module.exports = User;