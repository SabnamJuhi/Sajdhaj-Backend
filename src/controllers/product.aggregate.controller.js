// const sequelize = require("../config/db")

// const Product = require("../models/products/product.model")
// const ProductPrice = require("../models/products/price.model")
// const ProductSpec = require("../models/products/productSpec.model")
// const ProductVariant = require("../models/productVariants/productVariant.model")
// const VariantImage = require("../models/productVariants/variantImage.model")
// const VariantSize = require("../models/productVariants/variantSize.model")


// const Offer = require("../models/offers/offer.model")
// const OfferSub = require("../models/offers/offerSub.model")
// const OfferApplicableCategory = require("../models/offers/offerApplicableCategory.model")
// const OfferApplicableProduct = require("../models/offers/offerApplicableProduct.model")
// const { ProductRating, ProductReview } = require("../models")

// exports.createProduct = async (req, res) => {
//   const t = await sequelize.transaction()

//   try {
//     const {
//       title,
//       categoryId,
//       subCategoryId,
//       productCategoryId,
//       description,
//       badge,
//       price,
//       specs,
//       variants,
//       offer
//     } = req.body

//     // 1️⃣ PRODUCT
//     const product = await Product.create(
//       {
//         title,
//         categoryId,
//         subCategoryId,
//         productCategoryId,
//         description,
//         badge
//       },
//       { transaction: t }
//     )

//     // 2️⃣ PRICE
//     await ProductPrice.create(
//       {
//         productId: product.id,
//         ...price
//       },
//       { transaction: t }
//     )

//     // 3️⃣ SPECS
//     for (const key in specs) {
//       const value = Array.isArray(specs[key])
//         ? specs[key].join(", ")
//         : specs[key]

//       await ProductSpec.create(
//         {
//           productId: product.id,
//           specKey: key,
//           specValue: value
//         },
//         { transaction: t }
//       )
//     }

//     // 4️⃣ VARIANTS
//     for (const v of variants) {
//       // CORRECT SYNTAX: { where: { ... }, defaults: { ... }, transaction: t }
//       const [variant, created] = await ProductVariant.findOrCreate({
//         where: { variantCode: v.variantId }, 
//         defaults: {
//           productId: product.id,
//           colorName: v.color.name,
//           colorCode: v.color.code,
//           colorSwatch: v.color.swatch,
//           totalStock: v.totalStock,
//           stockStatus: v.stockStatus
//         },
//         transaction: t
//       })

//       // Only add images and sizes if the variant was newly created
//       if (created) {
//         for (const img of v.images) {
//           await VariantImage.create({ variantId: variant.id, imageUrl: img }, { transaction: t })
//         }
//         for (const s of v.sizes) {
//           await VariantSize.create({ variantId: variant.id, ...s }, { transaction: t })
//         }
//       }
//     }

//     // 5️⃣ OFFER (OPTIONAL)
//     if (offer) {
//       const [targetOffer, offerCreated] = await Offer.findOrCreate({
//         where: { offerCode: offer.offerCode },
//         defaults: {
//           title: offer.title,
//           festival: offer.festival,
//           description: offer.description,
//           startDate: offer.startDate,
//           endDate: offer.endDate,
//           isActive: offer.isActive
//         },
//         transaction: t
//       })

//       // 6️⃣ SUB OFFERS (Only create if the offer itself is brand new)
//       if (offerCreated && offer.subOffers) {
//         for (const sub of offer.subOffers) {
//           await OfferSub.create(
//             { offerId: targetOffer.id, ...sub },
//             { transaction: t }
//           )
//         }
//       }

//       // 7️⃣ LINK PRODUCT TO OFFER (Always do this)
//       // Use the applicability logic provided in the request
//       if (offer.applicability?.products) {
//         for (const p of offer.applicability.products) {
//           for (const subOfferId of p.subOfferIds) {
//             await OfferApplicableProduct.findOrCreate({
//               where: {
//                 offerId: targetOffer.id,
//                 productId: product.id,
//                 subOfferId: subOfferId
//               },
//               transaction: t
//             })
//           }
//         }
//       }
//     }

//     await t.commit()
//     return res.status(201).json({
//       success: true,
//       message: "Product created and linked successfully",
//       productId: product.id
//     })

//   } catch (error) {
//     await t.rollback()
//     console.error(error)
//     return res.status(500).json({ success: false, message: error.message })
//   }
// }


// exports.getProductById = async (req, res) => {
//   try {
//     const productId = req.params.id;

//     const product = await Product.findByPk(productId, {
//       include: [
//         // Use 'as' to match your associations file
//         { model: ProductPrice, as: "price" }, 
//         { model: ProductSpec, as: "specs" },
//         { model: ProductRating, as: "rating" },
//         { model: ProductReview, as: "reviews" },
//         {
//           model: ProductVariant,
//           as: "variants",
//           include: [
//             { model: VariantImage, as: "images" }, 
//             { model: VariantSize, as: "sizes" }   
//           ]
//         },
//        {
//           model: OfferApplicableProduct,
//           as: "offerApplicableProducts",
//           include: [
//             {
//               model: Offer,
//               as: "offerDetails",
//               include: [{ model: OfferSub, as: "subOffers" }]
//             }
//           ]
//         }
//       ]
//     });

//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     res.json({
//       success: true,
//       data: product
//     });

//   } catch (err) {
//     console.error("Fetch Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.updateProductDetails = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { id } = req.params;
//     const { 
//       title, description, badge, isActive, 
//       price, specs 
//     } = req.body;

//     // 1. Check if product exists
//     const product = await Product.findByPk(id);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     // 2. Update Core Product Table
//     await product.update({ title, description, badge, isActive }, { transaction: t });

//     // 3. Update Price Table (using upsert - updates if exists, creates if not)
//     if (price) {
//       await ProductPrice.upsert({
//         productId: id,
//         ...price
//       }, { transaction: t });
//     }

//     // 4. Update Specs Table (Delete and Re-create approach is cleanest for arrays)
//     if (specs && Array.isArray(specs)) {
//       // Remove old specs
//       await ProductSpec.destroy({ where: { productId: id }, transaction: t });
      
//       // Bulk create new specs
//       const specsWithId = specs.map(spec => ({ ...spec, productId: id }));
//       await ProductSpec.bulkCreate(specsWithId, { transaction: t });
//     }

//     await t.commit();

//     // Fetch updated product to return
//     const updatedProduct = await Product.findByPk(id, {
//       include: [
//         { model: ProductPrice, as: "price" },
//         { model: ProductSpec, as: "specs" }
//       ]
//     });

//     res.json({
//       success: true,
//       message: "Product updated successfully",
//       data: updatedProduct
//     });

//   } catch (err) {
//     await t.rollback();
//     console.error("Update Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };





const sequelize = require("../config/db")


const Product = require("../models/products/product.model")
const ProductPrice = require("../models/products/price.model")
const ProductSpec = require("../models/products/productSpec.model")
const ProductVariant = require("../models/productVariants/productVariant.model")
const VariantImage = require("../models/productVariants/variantImage.model")
const VariantSize = require("../models/productVariants/variantSize.model")


const Offer = require("../models/offers/offer.model")
const OfferSub = require("../models/offers/offerSub.model")
const OfferApplicableCategory = require("../models/offers/offerApplicableCategory.model")
const OfferApplicableProduct = require("../models/offers/offerApplicableProduct.model")
const { ProductRating, ProductReview, Category, SubCategory, ProductCategory } = require("../models")

exports.createProduct = async (req, res) => {
  const t = await sequelize.transaction()

  try {
    const {
      title,
      categoryId,
      subCategoryId,
      productCategoryId,
      description,
      badge,
      price,
      specs,
      variants,
      offer
    } = req.body

    // 1️⃣ PRODUCT
    const product = await Product.create(
      {
        title,
        categoryId,
        subCategoryId,
        productCategoryId,
        description,
        badge
      },
      { transaction: t }
    )

    // 2️⃣ PRICE
    await ProductPrice.create(
      {
        productId: product.id,
        ...price
      },
      { transaction: t }
    )

    // 3️⃣ SPECS
    for (const key in specs) {
      const value = Array.isArray(specs[key])
        ? specs[key].join(", ")
        : specs[key]

      await ProductSpec.create(
        {
          productId: product.id,
          specKey: key,
          specValue: value
        },
        { transaction: t }
      )
    }

    // 4️⃣ VARIANTS
    for (const v of variants) {
      // CORRECT SYNTAX: { where: { ... }, defaults: { ... }, transaction: t }
      const [variant, created] = await ProductVariant.findOrCreate({
        where: { variantCode: v.variantId }, 
        defaults: {
          productId: product.id,
          colorName: v.color.name,
          colorCode: v.color.code,
          colorSwatch: v.color.swatch,
          totalStock: v.totalStock,
          stockStatus: v.stockStatus
        },
        transaction: t
      })

      // Only add images and sizes if the variant was newly created
      if (created) {
        for (const img of v.images) {
          await VariantImage.create({ variantId: variant.id, imageUrl: img }, { transaction: t })
        }
        for (const s of v.sizes) {
          await VariantSize.create({ variantId: variant.id, ...s }, { transaction: t })
        }
      }
    }

    // 5️⃣ OFFER (OPTIONAL)
    if (offer) {
      const [targetOffer, offerCreated] = await Offer.findOrCreate({
        where: { offerCode: offer.offerCode },
        defaults: {
          title: offer.title,
          festival: offer.festival,
          description: offer.description,
          startDate: offer.startDate,
          endDate: offer.endDate,
          isActive: offer.isActive
        },
        transaction: t
      })

      // 6️⃣ SUB OFFERS (Only create if the offer itself is brand new)
      if (offerCreated && offer.subOffers) {
        for (const sub of offer.subOffers) {
          await OfferSub.create(
            { offerId: targetOffer.id, ...sub },
            { transaction: t }
          )
        }
      }

      // 7️⃣ LINK PRODUCT TO OFFER (Always do this)
      // Use the applicability logic provided in the request
      if (offer.applicability?.products) {
        for (const p of offer.applicability.products) {
          for (const subOfferId of p.subOfferIds) {
            await OfferApplicableProduct.findOrCreate({
              where: {
                offerId: targetOffer.id,
                productId: product.id,
                subOfferId: subOfferId
              },
              transaction: t
            })
          }
        }
      }
    }

    await t.commit()
    return res.status(201).json({
      success: true,
      message: "Product created and linked successfully",
      productId: product.id
    })

  } catch (error) {
    await t.rollback()
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}


exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId, {
      include: [
        // --- Category Hierarchy ---
        { model: Category, as: "Category", attributes: ["id", "name"] },
        { model: SubCategory, as: "SubCategory", attributes: ["id", "name"] },
        { model: ProductCategory, as: "ProductCategory", attributes: ["id", "name"] },
        // Use 'as' to match your associations file
        { model: ProductPrice, as: "price" }, 
        { model: ProductSpec, as: "specs" },
        { model: ProductRating, as: "rating" },
        { model: ProductReview, as: "reviews" },
        {
          model: ProductVariant,
          as: "variants",
          include: [
            { model: VariantImage, as: "images" }, 
            { model: VariantSize, as: "sizes" }   
          ]
        },
       {
          model: OfferApplicableProduct,
          as: "offerApplicableProducts",
          include: [
            {
              model: Offer,
              as: "offerDetails",
              include: [{ model: OfferSub, as: "subOffers" }]
            }
          ]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProductDetails = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { 
      title, description, badge, isActive, 
      price, specs 
    } = req.body;

    // 1. Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Update Core Product Table
    await product.update({ title, description, badge, isActive }, { transaction: t });

    // 3. Update Price Table (using upsert - updates if exists, creates if not)
    if (price) {
      await ProductPrice.upsert({
        productId: id,
        ...price
      }, { transaction: t });
    }

    // 4. Update Specs Table (Delete and Re-create approach is cleanest for arrays)
    if (specs && Array.isArray(specs)) {
      // Remove old specs
      await ProductSpec.destroy({ where: { productId: id }, transaction: t });
      
      // Bulk create new specs
      const specsWithId = specs.map(spec => ({ ...spec, productId: id }));
      await ProductSpec.bulkCreate(specsWithId, { transaction: t });
    }

    await t.commit();

    // Fetch updated product to return
    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: ProductPrice, as: "price" },
        { model: ProductSpec, as: "specs" }
      ]
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (err) {
    await t.rollback();
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllProductsDetails = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        // Category Names
        { model: Category, as: "Category", attributes: ["id", "name"] },
        { model: SubCategory, as: "SubCategory", attributes: ["id", "name"] },
        { model: ProductCategory, as: "ProductCategory", attributes: ["id", "name"] },

        // Pricing and Details
        { model: ProductPrice, as: "price" },
        { model: ProductSpec, as: "specs" },
        {
          model: ProductVariant,
          as: "variants",
          include: [
            { model: VariantImage, as: "images" },
            { model: VariantSize, as: "sizes" }
          ]
        },
        {
          model: OfferApplicableProduct,
          as: "offerApplicableProducts",
          include: [
            {
              model: Offer,
              as: "offerDetails",
              include: [{ model: OfferSub, as: "subOffers" }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.softDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    // Just flip the switch
    await product.update({ isActive: false });

    res.json({ success: true, message: "Product deactivated (Archived)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};