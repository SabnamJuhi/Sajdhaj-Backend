const sequelize = require("../../config/db");

const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");
const ProductSpec = require("../../models/products/productSpec.model");
const ProductVariant = require("../../models/productVariants/productVariant.model");
const VariantImage = require("../../models/productVariants/variantImage.model");
const VariantSize = require("../../models/productVariants/variantSize.model");

const Offer = require("../../models/offers/offer.model");
const OfferSub = require("../../models/offers/offerSub.model");
const OfferApplicableCategory = require("../../models/offers/offerApplicableCategory.model");
const OfferApplicableProduct = require("../../models/offers/offerApplicableProduct.model");

const {
  Category,
  SubCategory,
  ProductCategory,
  ProductRating,
  ProductReview,
} = require("../../models");

// exports.getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findByPk(id, {
//       attributes: [
//         "id",
//         "sku",
//         "title",
//         "description",
//         "brandName",
//         "badge",
//         "gstRate",
//         "isActive",
//         "createdAt",
//         "updatedAt",
//       ],

//       include: [
//         // CATEGORY HIERARCHY

//         {
//           model: Category,
//           as: "Category",
//           attributes: ["id", "name"],
//         },
//         {
//           model: SubCategory,
//           as: "SubCategory",
//           attributes: ["id", "name"],
//         },
//         {
//           model: ProductCategory,
//           as: "ProductCategory",
//           attributes: ["id", "name"],
//         },

//         // PRICE

//         {
//           model: ProductPrice,
//           as: "price",
//         },

//         // SPECS

//         {
//           model: ProductSpec,
//           as: "specs",
//         },

//         // RATINGS & REVIEWS

//         {
//           model: ProductRating,
//           as: "rating",
//         },
//         {
//           model: ProductReview,
//           as: "reviews",
//         },

//         // VARIANTS (IMAGES + SIZES)

//         {
//           model: ProductVariant,
//           as: "variants",
//           attributes: [
//             "id",
//             "variantCode",
//             "colorName",
//             "colorCode",
//             "colorSwatch",
//             "totalStock",
//             "stockStatus",
//             "isActive",
//           ],
//           include: [
//             {
//               model: VariantImage,
//               as: "images",
//               attributes: ["id", "imageUrl"],
//             },
//             {
//               model: VariantSize,
//               as: "sizes",
//               attributes: ["id", "size", "stock", "chest"],
//             },
//           ],
//         },

//         // OFFERS (PRODUCT → OFFER → SUB OFFERS)

//         {
//           model: OfferApplicableProduct,
//           as: "offerApplicableProducts",
//           attributes: ["id", "offerId", "subOfferId"],
//           include: [
//             {
//               model: Offer,
//               as: "offerDetails",
//               attributes: [
//                 "id",
//                 "offerCode",
//                 "title",
//                 "festival",
//                 "description",
//                 "startDate",
//                 "endDate",
//                 "isActive",
//               ],
//               include: [
//                 {
//                   model: OfferSub,
//                   as: "subOffers",
//                   attributes: [
//                     "id",
//                     "discountType",
//                     "discountValue",
//                     "maxDiscount",
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     return res.json({
//       success: true,
//       data: product,
//     });
//   } catch (error) {
//     console.error("GET PRODUCT ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.getProductById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const productId = req.params.id;

    const product = await Product.findByPk(productId, {
      attributes: [
        "id",
        "sku",
        "title",
        "description",
        "brandName",
        "badge",
        "gstRate",
        "isActive",
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
        { model: ProductSpec, as: "specs" },

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
              attributes: ["id", "size", "stock", "chest"],
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

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const p = product.toJSON();

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
