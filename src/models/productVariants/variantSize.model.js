// models/variantSize.model.js
const { Model, DataTypes } = require("sequelize")
const sequelize = require("../../config/db")

class VariantSize extends Model {}

VariantSize.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
   
    sizeMasterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: "variant_sizes"
  }
)

module.exports = VariantSize
