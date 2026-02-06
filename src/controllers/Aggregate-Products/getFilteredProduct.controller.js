const { Op } = require("sequelize");


const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");
const ProductSpec = require("../../models/products/productSpec.model");
const ProductVariant = require("../../models/productVariants/productVariant.model");
const VariantSize = require("../../models/productVariants/variantSize.model");


exports.getFilteredProducts = async (req, res) => {
  try {
    const {
      categoryId,
      subCategoryId,
      productCategoryId,
      brands,
      colors,
      sizes,
      minPrice,
      maxPrice,
      inStock,
      specs,
    } = req.query;

    /* ---------------- HELPER ---------------- */
    const toArray = (val) => (val ? val.split(",").map((v) => v.trim()) : []);

    /* ---------------- PRODUCT WHERE ---------------- */
    const productWhere = {
      isActive: true,
    };

    if (categoryId) {
      productWhere.categoryId = { [Op.in]: toArray(categoryId) };
    }

    if (subCategoryId) {
      productWhere.subCategoryId = { [Op.in]: toArray(subCategoryId) };
    }

    if (productCategoryId) {
      productWhere.productCategoryId = { [Op.in]: toArray(productCategoryId) };
    }

    if (brands) {
      productWhere.brandName = { [Op.in]: toArray(brands) };
    }

    /* ---------------- PRICE WHERE ---------------- */
    const priceWhere = {};

    if (minPrice || maxPrice) {
      priceWhere.sellingPrice = {};
      if (minPrice) priceWhere.sellingPrice[Op.gte] = Number(minPrice);
      if (maxPrice) priceWhere.sellingPrice[Op.lte] = Number(maxPrice);
    }

    /* ---------------- VARIANT WHERE ---------------- */
    const variantWhere = {};

    if (colors) {
      variantWhere.colorName = { [Op.in]: toArray(colors) };
    }

    if (inStock === "true") {
      variantWhere.totalStock = { [Op.gt]: 0 };
    }

    /* ---------------- SIZE WHERE ---------------- */
    const sizeWhere = {};

    if (sizes) {
      sizeWhere.size = { [Op.in]: toArray(sizes) };
      if (inStock === "true") {
        sizeWhere.stock = { [Op.gt]: 0 };
      }
    }

    /* ---------------- SPECS WHERE ---------------- */
    const specIncludes = [];

    if (specs && typeof specs === "object") {
      Object.entries(specs).forEach(([key, value]) => {
        const values = toArray(value);

        specIncludes.push({
          model: ProductSpec,
          as: "specs",
          where: {
            specKey: key,
            specValue: {
              [Op.or]: values.map((v) => ({ [Op.like]: `%${v}%` })),
            },
          },
          required: true,
        });
      });
    }

    /* ---------------- FINAL QUERY ---------------- */
    const products = await Product.findAll({
      where: productWhere,

      include: [
        {
          model: ProductPrice,
          as: "price",
          where: priceWhere,
          required: Object.keys(priceWhere).length > 0,
        },

        {
          model: ProductVariant,
          as: "variants",
          where: variantWhere,
          required: Object.keys(variantWhere).length > 0,

          include: [
            {
              model: VariantSize,
              as: "sizes",
              where: sizeWhere,
              required:
                Object.keys(variantWhere).length > 0 ||
                Object.keys(sizeWhere).length > 0,
            },
          ],
        },

        ...specIncludes,
      ],

      distinct: true,
    });

    return res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("FILTER PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};