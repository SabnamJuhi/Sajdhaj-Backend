const sequelize = require("../config/db")

// Category
const Category = require("./category/category.model")
const SubCategory = require("./category/subcategory.model")
const ProductCategory = require("./category/productCategory.model")

// Product core
const Product = require("./products/product.model")
const ProductRating = require("./products/productRating.model")
const ProductReview = require("./products/productReview.model")
const ProductSpec = require("./products/productSpec.model")

// Variants
const ProductVariant = require("./productVariants/productVariant.model")
const VariantImage = require("./productVariants/variantImage.model")
const VariantSize = require("./productVariants/variantSize.model")

//Offers
const Offer = require("./offers/offer.model")
const OfferSub = require("./offers/offerSub.model")
const OfferApplicableCategory = require("./offers/offerApplicableCategory.model")
const OfferApplicableProduct = require("./offers/offerApplicableProduct.model")


// SubCategory Relations
Category.hasMany(SubCategory, {foreignKey: "categoryId",as: "subcategories"})
SubCategory.belongsTo(Category, {foreignKey: "categoryId",as: "category"})

//ProductCategory relations
Category.hasMany(ProductCategory, {foreignKey: "categoryId",as: "productCategories"})
SubCategory.hasMany(ProductCategory, { foreignKey: "subCategoryId", as: "productCategories"})

ProductCategory.belongsTo(Category, {foreignKey: "categoryId",as: "category"})
ProductCategory.belongsTo(SubCategory, {foreignKey: "subCategoryId",as: "subCategory"})

// Product relations
Category.hasMany(Product, { foreignKey: "categoryId" })
SubCategory.hasMany(Product, { foreignKey: "subCategoryId" })
ProductCategory.hasMany(Product, { foreignKey: "productCategoryId" })

Product.belongsTo(Category, { foreignKey: "categoryId" })
Product.belongsTo(SubCategory, { foreignKey: "subCategoryId" })
Product.belongsTo(ProductCategory, { foreignKey: "productCategoryId" })

//productRating Relations
Product.hasOne(ProductRating, {foreignKey: "productId",as: "rating"})
ProductRating.belongsTo(Product, {foreignKey: "productId"})

//ProductReview Relations
Product.hasMany(ProductReview, {foreignKey: "productId",as: "reviews"})
ProductReview.belongsTo(Product, {foreignKey: "productId"})

//ProductSpec Relations
Product.hasMany(ProductSpec, {foreignKey: "productId",as: "specs"})
ProductSpec.belongsTo(Product, {foreignKey: "productId",as: "product"})

//ProductVariant Relations
ProductVariant.hasMany(VariantImage, { foreignKey: "variantId" })
ProductVariant.hasMany(VariantSize, { foreignKey: "variantId" })

VariantImage.belongsTo(ProductVariant, { foreignKey: "variantId" })
VariantSize.belongsTo(ProductVariant, { foreignKey: "variantId" })



Offer.hasMany(OfferSub, { foreignKey: "offerId", as: "subOffers" })
Offer.hasMany(OfferApplicableCategory, {foreignKey: "offerId", as: "applicableCategories"})
Offer.hasMany(OfferApplicableProduct, {foreignKey: "offerId", as: "applicableProducts"})

OfferSub.belongsTo(Offer, { foreignKey: "offerId" })
OfferApplicableCategory.belongsTo(Offer, { foreignKey: "offerId" })
OfferApplicableProduct.belongsTo(Offer, { foreignKey: "offerId" })


module.exports = {
  sequelize,
  Category,
  SubCategory,
  ProductCategory,
  Product,
  ProductRating,
  ProductReview,
  ProductSpec,
  ProductVariant,
  VariantImage,
  VariantSize,
  Offer,
  OfferSub,
  OfferApplicableCategory,
  OfferApplicableProduct
}
