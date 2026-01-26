const { Model, DataTypes } = require("sequelize")
const sequelize = require("../../config/db")

class ProductCategory extends Model {}
ProductCategory.init(
  {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      subCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
     {
    sequelize,
    modelName: "ProductCategory",
    tableName: "product_categorie"
    }
  )

module.exports = ProductCategory