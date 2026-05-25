

const { Op } = require("sequelize");

const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");
const ProductSpec = require("../../models/products/productSpec.model");
const ProductVariant = require("../../models/productVariants/productVariant.model");
const VariantSize = require("../../models/productVariants/variantSize.model");
const VariantImage = require("../../models/productVariants/variantImage.model");
const Category = require("../../models/category/category.model");
const SubCategory = require("../../models/category/subcategory.model");
const Wishlist = require("../../models/wishlist.model");

const {
  getPaginationOptions,
  formatPagination,
} = require("../../utils/paginate");

exports.getFilteredProducts = async (req, res) => {
  try {
    const {
      categoryId,
      subCategoryId,
      // productCategoryId,
      brands,
      colors,
      sizes,
      minPrice,
      maxPrice,
      inStock,
      specs,
    } = req.query;

    const userId = req.user?.id;

    const paginationOptions = getPaginationOptions(req.query);
    const { limit, offset, currentPage } = paginationOptions;

    const toArray = (val) => (val ? val.split(",").map((v) => v.trim()) : []);

    /* ---------- PRODUCT WHERE ---------- */

    const productWhere = {};

    if (req.query.isActive !== undefined) {
      productWhere.isActive = req.query.isActive === "true";
    }

    /* ---------- CATEGORY FILTER ---------- */

    const categories = toArray(categoryId).map(Number);
    const subCategories = toArray(subCategoryId).map(Number);
    // const productCategories = toArray(productCategoryId).map(Number);

    if (categories.length) {
      const orConditions = [];

      categories.forEach((catId) => {
        const condition = { categoryId: catId };

        if (subCategories.length) {
          condition.subCategoryId = { [Op.in]: subCategories };
        }

        // if (productCategories.length) {
        //   condition.productCategoryId = { [Op.in]: productCategories };
        // }

        orConditions.push(condition);
      });

      productWhere[Op.or] = orConditions;
    }

    /* ---------- BRAND FILTER ---------- */

    if (brands) {
      productWhere.brandName = { [Op.in]: toArray(brands) };
    }

    /* ---------- PRICE FILTER ---------- */

    const priceWhere = {};

    if (minPrice || maxPrice) {
      priceWhere.sellingPrice = {};

      if (minPrice) priceWhere.sellingPrice[Op.gte] = Number(minPrice);
      if (maxPrice) priceWhere.sellingPrice[Op.lte] = Number(maxPrice);
    }

    /* ---------- VARIANT FILTER ---------- */

    const variantWhere = { isActive: true };

    if (colors) {
      variantWhere.colorName = {
        [Op.in]: toArray(colors),
      };
    }

    /* ---------- SIZE FILTER ---------- */

    const sizeWhere = {};

    if (sizes) {
      sizeWhere.size = {
        [Op.in]: toArray(sizes),
      };
    }

    if (inStock === "true") {
      sizeWhere.stock = { [Op.gt]: 0 };
    }

    /* ---------- SPEC FILTER ---------- */

    const specFilterIncludes = [];

    if (specs && typeof specs === "object") {
      Object.entries(specs).forEach(([key, value]) => {
        const values = toArray(value);

        specFilterIncludes.push({
          model: ProductSpec,
          as: "specs",
          attributes: [],
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

    /* ---------- QUERY ---------- */

    const { rows: products, count } = await Product.findAndCountAll({
      where: productWhere,

      attributes: [
        "id",
        "sku",
        "title",
        "brandName",
        "badge",
        "isActive",
        "createdAt",
      ],

      include: [
        {
          model: Category,
          as: "Category",
          attributes: ["id", "name"],
        },

        {
          model: SubCategory,
          as: "SubCategory",
          attributes: ["id", "name"],
        },

        {
          model: ProductPrice,
          as: "price",
          where: Object.keys(priceWhere).length ? priceWhere : undefined,
          required: Object.keys(priceWhere).length > 0,
        },

        {
          model: ProductSpec,
          as: "specs",
          attributes: ["id", "specKey", "specValue"],
          required: false,
        },

        {
          model: ProductVariant,
          as: "variants",
          where: variantWhere,
          required: colors ? true : false,

          include: [
            {
              model: VariantImage,
              as: "images",
              attributes: ["id", "imageUrl"],
              required: false,
            },

            {
              model: VariantSize,
              as: "sizes",
              where: Object.keys(sizeWhere).length ? sizeWhere : undefined,
              required: sizes || inStock === "true",
            },
          ],
        },

        ...specFilterIncludes,
      ],

      distinct: true,
      limit,
      offset,

      order: [["createdAt", "DESC"]],
    });

    /* ---------- WISHLIST ---------- */

    let wishlistedMap = {};

    if (userId) {
      const wishlist = await Wishlist.findAll({
        where: { userId },
        attributes: ["productId", "variantId"],
      });

      wishlist.forEach((w) => {
        if (!wishlistedMap[w.productId]) {
          wishlistedMap[w.productId] = [];
        }

        wishlistedMap[w.productId].push(w.variantId);
      });
    }

    const finalProducts = products.map((p) => {
      const productWishlisted = !!wishlistedMap[p.id];

      return {
        ...p.toJSON(),
        isWishlisted: productWishlisted,
        wishlistedVariants: wishlistedMap[p.id] || [],
      };
    });

    /* ---------- PAGINATION ---------- */

    const response = formatPagination(
      { count, rows: finalProducts },
      currentPage,
      limit
    );

    return res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("FILTER PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};