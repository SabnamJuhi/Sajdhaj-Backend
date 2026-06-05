const sequelize = require("../../config/db");

const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");
const ProductSpec = require("../../models/products/productSpec.model");
const ProductVariant = require("../../models/productVariants/productVariant.model");
const VariantImage = require("../../models/productVariants/variantImage.model");
const VariantSize = require("../../models/productVariants/variantSize.model");
const SizeMaster = require("../../models/products/sizeMaster.model");
const Wishlist = require("../../models/wishlist.model");

const Offer = require("../../models/offers/offer.model");
const OfferSub = require("../../models/offers/offerSub.model");
const OfferApplicableCategory = require("../../models/offers/offerApplicableCategory.model");
const OfferApplicableProduct = require("../../models/offers/offerApplicableProduct.model");

const {
  Category,
  SubCategory,
  // ProductCategory,
  ProductRating,
  ProductReview,
} = require("../../models");

exports.getProductByQRCode = async (req, res) => {
  try {
    const userId = req.user?.id;
    // const productId = req.params.id;
    const { productCode } = req.params;
    console.log("params =", req.params);
    console.log("productCode =", productCode);

    // const product = await Product.findOne(productCode, {
    //   attributes: [
    //     "id",
    //     "sku",
    //     "title",
    //     "productType",
    //     "productCode",
    //     "description",
    //     "brandName",
    //     "badge",
    //     // "gstRate",
    //     "isActive",
    //     "createdAt",
    //   ],
    const product = await Product.findOne({
      where: {
        productCode,
      },

      attributes: [
        "id",
        "sku",
        "title",
        "productType",
        "productCode",
        "description",
        "brandName",
        "badge",
        "isActive",
        "createdAt",
      ],

      include: [
        { model: Category, as: "Category", attributes: ["id", "name"] },
        { model: SubCategory, as: "SubCategory", attributes: ["id", "name"] },
        // {
        //   model: ProductCategory,
        //   as: "ProductCategory",
        //   attributes: ["id", "name"],
        // },

        { model: ProductPrice, as: "price" },
        { model: ProductSpec, as: "specs" },

        {
          model: ProductVariant,
          as: "variants",
          attributes: [
            "id",
            "variantCode",
            "colorName",
            "colorCode",
            // "colorSwatch",
            "totalStock",
            "stockStatus",
            "isActive",
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
              separate: true,
              order: [
                [{ model: SizeMaster, as: "sizeDetails" }, "sortOrder", "ASC"],
              ],
              attributes: ["id", "sizeMasterId", "stock"],
              include: [
                {
                  model: SizeMaster,
                  as: "sizeDetails",
                  attributes: ["id", "name", "sortOrder"],
                },
              ],
            },
          ],
        },
        {
          model: ProductRating,
          as: "rating",
          attributes: [
            "averageRating",
            "totalRatings",
            "totalReviews",
            "fiveStar",
            "fourStar",
            "threeStar",
            "twoStar",
            "oneStar",
          ],
        },

        {
          model: ProductReview,
          as: "reviews",
          attributes: [
            "id",
            "userId",
            "userName",
            "rating",
            "title",
            "reviewText",
            "likes",
            "dislikes",
            "isVerifiedBuyer",
            "createdAt",
          ],
          order: [["createdAt", "DESC"]],
          limit: 10,
        },

        {
          model: OfferApplicableProduct,
          as: "offerApplicableProducts",
          attributes: ["id", "offerId", "subOfferId"],
          include: [
            {
              model: Offer,
              as: "offerDetails",
              attributes: [
                "id",
                "offerCode",
                "title",
                "festival",
                "description",
                "startDate",
                "endDate",
                "isActive",
              ],
              include: [
                {
                  model: OfferSub,
                  as: "subOffers",
                  attributes: [
                    "id",
                    "discountType",
                    "discountValue",
                    "maxDiscount",
                    "minOrderValue",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    console.log("product =", product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const p = product.toJSON();

    /* ======================================================
   FORMAT VARIANT SIZES
====================================================== */

    p.variants = p.variants.map((variant) => {
      const formattedSizes = variant.sizes.map((size) => {
        const isCustomized = p.productType === "CUSTOMIZED";

        return {
          id: size.id,

          sizeMasterId: size.sizeMasterId,

          size: size.sizeDetails?.name,

          stock: isCustomized ? 1 : size.stock,

          inStock: isCustomized ? true : size.stock > 0,
        };
      });

      return {
        ...variant,

        totalStock: p.productType === "CUSTOMIZED" ? 1 : variant.totalStock,

        stockStatus:
          p.productType === "CUSTOMIZED" ? "In Stock" : variant.stockStatus,

        sizes: formattedSizes,
      };
    });
    /* ---------------- WISHLIST ---------------- */

    let wishlistedVariants = [];

    if (userId) {
      const wishlist = await Wishlist.findAll({
        where: { userId, productId },
        attributes: ["variantId"],
      });

      wishlistedVariants = wishlist.map((w) => w.variantId);
    }

    const isWishlisted = wishlistedVariants.length > 0;

    /* ---------------- PRICING ---------------- */

    const mrp = p.price?.mrp || 0;
    const sellingPrice = p.price?.sellingPrice || 0;
    const productDiscount = p.price?.discountPercentage || 0;

    let offerDiscountPercent = 0;
    let maxDiscount = 0;
    let minOrderValue = 0;
    let discountAmount = 0;
    let finalPrice = sellingPrice;
    let offerCode = null;

    if (p.offerApplicableProducts?.length) {
      const offer = p.offerApplicableProducts[0];
      const offerDetails = offer.offerDetails;

      const today = new Date();

      if (
        offerDetails?.isActive &&
        new Date(offerDetails.startDate) <= today &&
        new Date(offerDetails.endDate) >= today
      ) {
        offerCode = offerDetails.offerCode;

        const subOffer =
          offerDetails?.subOffers?.find((s) => s.id === offer.subOfferId) ||
          offerDetails?.subOffers?.[0];

        if (subOffer) {
          offerDiscountPercent = subOffer.discountValue;
          maxDiscount = subOffer.maxDiscount || 0;
          minOrderValue = subOffer.minOrderValue || 0;

          /* ---------- MIN ORDER VALUE CHECK ---------- */

          if (sellingPrice >= minOrderValue) {
            if (subOffer.discountType === "PERCENTAGE") {
              discountAmount = (sellingPrice * offerDiscountPercent) / 100;

              if (maxDiscount && discountAmount > maxDiscount) {
                discountAmount = maxDiscount;
              }
            }

            if (subOffer.discountType === "FLAT") {
              discountAmount = subOffer.discountValue;
            }

            finalPrice = sellingPrice - discountAmount;
          }
        }
      }
    }

    /* ---------------- RESPONSE ---------------- */

    const response = {
      ...p,

      pricing: {
        mrp,
        sellingPrice,
        productDiscountPercent: productDiscount,

        offerCode,

        offerDiscountPercent,
        maxDiscount,
        minOrderValue,

        discountAmount,
        youSave: discountAmount,

        finalPrice,
      },

      isWishlisted,
      wishlistedVariants,
    };

    return res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("GET PRODUCT DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
