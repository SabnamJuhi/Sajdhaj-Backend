const {
  Product,
  Category,
  ProductPrice,
  ProductVariant,
  SubCategory,
  ProductCategory,
  ProductRating,
  VariantSize,
  VariantImage,
} = require("../../models");
const {
  getPaginationOptions,
  formatPagination,
} = require("../../utils/paginate");
const sequelize = require("../../config/db");
const { Op } = require("sequelize");

exports.getTopSoldProducts = async (req, res) => {
  try {
    const { limit, offset, currentPage } = getPaginationOptions(req.query);

    const result = await Product.findAndCountAll({
      where: {
        isActive: true,
      },

      attributes: [
        "id",
        "sku",
        "title",
        "description",
        "brandName",
        "badge",
        "gstRate",
        "soldCount",
        "createdAt",
      ],

      include: [
        { model: Category, as: "Category", attributes: ["id", "name"] },
        { model: SubCategory, as: "SubCategory", attributes: ["id", "name"] },
        {
          model: ProductCategory,
          as: "ProductCategory",
          attributes: ["id", "name"],
        },

        { model: ProductPrice, as: "price" },

        {
          model: ProductVariant,
          as: "variants",
          attributes: [
            "id",
            "variantCode",
            "colorName",
            "colorCode",
            "colorSwatch",
            "totalStock",
            "stockStatus",
          ],
          include: [
            {
              model: VariantImage,
              as: "images",
              attributes: ["id", "imageUrl"],
            },
            {
              model: VariantSize,
              as: "sizes",
              attributes: ["id", "size", "stock"],
            },
          ],
        },

        {
          model: ProductRating,
          as: "rating",
          attributes: ["averageRating", "totalRatings", "totalReviews"],
        },
      ],

      order: [["soldCount", "DESC"]], // ⭐ highest sold first
      limit,
      offset,
      distinct: true,
    });

    const response = formatPagination(result, currentPage, limit);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("TOP SOLD PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTopRatedProducts = async (req, res) => {
  try {
    const { limit, offset, currentPage } = getPaginationOptions(req.query);

    const result = await Product.findAndCountAll({
      where: {
        isActive: true,
      },

      attributes: [
        "id",
        "sku",
        "title",
        "description",
        "brandName",
        "badge",
        "gstRate",
        "createdAt",
      ],

      include: [
        { model: Category, as: "Category", attributes: ["id", "name"] },
        { model: SubCategory, as: "SubCategory", attributes: ["id", "name"] },
        {
          model: ProductCategory,
          as: "ProductCategory",
          attributes: ["id", "name"],
        },

        { model: ProductPrice, as: "price" },

        {
          model: ProductVariant,
          as: "variants",
          attributes: [
            "id",
            "variantCode",
            "colorName",
            "colorCode",
            "colorSwatch",
            "totalStock",
            "stockStatus",
          ],
          include: [
            {
              model: VariantImage,
              as: "images",
              attributes: ["id", "imageUrl"],
            },
            {
              model: VariantSize,
              as: "sizes",
              attributes: ["id", "size", "stock"],
            },
          ],
        },

        {
          model: ProductRating,
          as: "rating",
          required: true,
          attributes: ["averageRating", "totalRatings", "totalReviews"],
          where: {
            totalRatings: { [Op.gt]: 0 },
          },
        },
      ],

      order: [
        [{ model: ProductRating, as: "rating" }, "averageRating", "DESC"],
        [{ model: ProductRating, as: "rating" }, "totalReviews", "DESC"],
        [{ model: ProductRating, as: "rating" }, "totalRatings", "DESC"],
      ],

      limit,
      offset,
      distinct: true,
       subQuery: false 
    });

    const response = formatPagination(result, currentPage, limit);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("TOP RATED PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.getTopWishlistedProducts = async (req, res) => {
  try {

    const { limit, offset, currentPage } = getPaginationOptions(req.query);

    const result = await Product.findAndCountAll({
      where: {
        isActive: true
      },

      attributes: [
        "id",
        "sku",
        "title",
        "description",
        "brandName",
        "badge",
        "gstRate",
        "wishlistCount",
        "createdAt"
      ],

      include: [
        { model: Category, as: "Category", attributes: ["id", "name"] },
        { model: SubCategory, as: "SubCategory", attributes: ["id", "name"] },
        { model: ProductCategory, as: "ProductCategory", attributes: ["id", "name"] },

        { model: ProductPrice, as: "price" },

        {
          model: ProductVariant,
          as: "variants",
          attributes: [
            "id",
            "variantCode",
            "colorName",
            "colorCode",
            "colorSwatch",
            "totalStock",
            "stockStatus",
          ],
          include: [
            {
              model: VariantImage,
              as: "images",
              attributes: ["id", "imageUrl"],
            },
            {
              model: VariantSize,
              as: "sizes",
              attributes: ["id", "size", "stock"],
            },
          ],
        },

        {
          model: ProductRating,
          as: "rating",
          attributes: [
            "averageRating",
            "totalRatings",
            "totalReviews"
          ],
        }
      ],

      order: [["wishlistCount", "DESC"]], // ⭐ highest wishlist first
      limit,
      offset,
      distinct: true
    });

    const response = formatPagination(result, currentPage, limit);

    res.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error("TOP WISHLISTED ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
