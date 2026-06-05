// const fs = require("fs");
// const path = require("path");
// const QRCode = require("qrcode");
// const sequelize = require("../../config/db");

// const Product = require("../../models/products/product.model");
// const ProductPrice = require("../../models/products/price.model");
// const ProductSpec = require("../../models/products/productSpec.model");
// const ProductVariant = require("../../models/productVariants/productVariant.model");
// const VariantImage = require("../../models/productVariants/variantImage.model");
// const VariantSize = require("../../models/productVariants/variantSize.model");
// const OfferApplicableProduct = require("../../models/offers/offerApplicableProduct.model");
// const { calculatePrice } = require("../../services/price.service");

// /* ---------------- SAFE JSON PARSER ---------------- */
// const parseJSON = (data, fieldName) => {
//   try {
//     return typeof data === "string" ? JSON.parse(data) : data;
//   } catch {
//     throw new Error(`Invalid JSON format in "${fieldName}"`);
//   }
// };

// exports.createProduct = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     console.log("FILES RECEIVED:", req.files); // 🔥 debug

//     const {
//       title,
//       brandName,
//       categoryId,
//       subCategoryId,
//       productCode,
//       // productCategoryId,
//       description,
//       badge,
//       price,
//       specs,
//       variants,
//       appliedOffers,
//     } = req.body;

//     if (!title || !categoryId || !subCategoryId) {
//       throw new Error("Missing required product fields");
//     }
//     //nbhg
//     const parsedPrice = parseJSON(price, "price");
//     const parsedSpecs = parseJSON(specs, "specs");
//     const parsedVariants = parseJSON(variants, "variants");
//     const parsedAppliedOffers = appliedOffers
//       ? parseJSON(appliedOffers, "appliedOffers")
//       : [];

//     if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
//       throw new Error("At least one variant is required");
//     }

//     /* -------- MAP VARIANT IMAGES -------- */
//     const variantImagesMap = {};

//     for (const file of req.files || []) {
//       const match = file.fieldname.match(/^variantImages_(\d+)$/);
//       if (!match) continue;

//       const index = Number(match[1]);

//       if (!variantImagesMap[index]) variantImagesMap[index] = [];

//       if (variantImagesMap[index].length >= 5) {
//         throw new Error(`Max 5 images allowed for variant ${index}`);
//       }

//       const imagePath = `/uploads/products/${file.filename}`;
//       variantImagesMap[index].push(imagePath);
//     }
//     // if (gstRate === undefined || gstRate === null) {
//     //   throw new Error("GST rate is required");
//     // }
//     // const numericGst = Number(gstRate);

//     // if (isNaN(numericGst)) {
//     //   throw new Error("Invalid GST rate");
//     // }
//     /* ---------------- CREATE PRODUCT ---------------- */

//     if (!productCode) {
//       throw new Error("Product code is required");
//     }
//     const existingCode = await Product.findOne({
//       where: { productCode },
//     });

//     if (existingCode) {
//       throw new Error("Product code already exists");
//     }

//     //QR Code generate
//     const qrFolder = path.join(__dirname, "../../../uploads/qrcodes");

//     if (!fs.existsSync(qrFolder)) {
//       fs.mkdirSync(qrFolder, { recursive: true });
//     }

//     const safeFileName = productCode.replace(/[\/\\]/g, "-");

//     const qrFileName = `${safeFileName}.png`;

//     const qrAbsolutePath = path.join(qrFolder, qrFileName);

//     await QRCode.toFile(qrAbsolutePath, productCode);

//     const product = await Product.create(
//       {
//         title,
//         productCode,
//         brandName,
//         categoryId: Number(categoryId),
//         subCategoryId: Number(subCategoryId),
//         // productCategoryId: Number(productCategoryId),
//         description,
//         badge,
//         qrCode: `/uploads/qrcodes/${qrFileName}`,
//       },
//       { transaction: t },
//     );

//     const calculatedPrice = calculatePrice({
//       mrp: parsedPrice.mrp,
//       sellingPrice: parsedPrice.sellingPrice,
//       discountPercentage: parsedPrice.discountPercentage,
//     });

//     await ProductPrice.upsert(
//       {
//         productId: product.id,
//         mrp: calculatedPrice.mrp,
//         sellingPrice: calculatedPrice.sellingPrice,
//         discountPercentage: calculatedPrice.discountPercentage,
//         currency: parsedPrice.currency || "INR",
//       },
//       { transaction: t },
//     );

//     /* ---------------- SPECS ---------------- */
//     const specRows = Object.keys(parsedSpecs).map((key) => ({
//       productId: product.id,
//       specKey: key,
//       specValue: Array.isArray(parsedSpecs[key])
//         ? parsedSpecs[key].join(", ")
//         : parsedSpecs[key],
//     }));

//     if (specRows.length) {
//       await ProductSpec.bulkCreate(specRows, { transaction: t });
//     }

//     /* ---------------- VARIANTS ---------------- */
//     for (let i = 0; i < parsedVariants.length; i++) {
//       const v = parsedVariants[i];

//       const variant = await ProductVariant.create(
//         {
//           productId: product.id,
//           variantCode: v.variantCode,
//           colorName: v.color?.name,
//           colorCode: v.color?.code,
//           swatch: v.color?.swatch || null,
//           totalStock: v.totalStock || 0,
//           stockStatus: v.stockStatus || "Out of Stock",
//         },
//         { transaction: t },
//       );

//       /* -------- IMAGES -------- */
//       const images = variantImagesMap[i] || [];

//       if (images.length) {
//         await VariantImage.bulkCreate(
//           images.map((img) => ({
//             variantId: variant.id,
//             imageUrl: img,
//           })),
//           { transaction: t },
//         );
//       }

//       /* -------- SIZES -------- */
//       if (Array.isArray(v.sizes) && v.sizes.length) {
//         await VariantSize.bulkCreate(
//           v.sizes.map((s) => ({
//             variantId: variant.id,
//             size: s.size,
//             stock: s.stock,
//             // chest: s.chest ?? null,
//           })),
//           { transaction: t },
//         );
//       }
//     }

//     /* ---------------- OFFERS ---------------- */
//     if (parsedAppliedOffers.length) {
//       await OfferApplicableProduct.bulkCreate(
//         parsedAppliedOffers.map((o) => ({
//           productId: product.id,
//           offerId: o.offerId,
//           subOfferId: o.subOfferId,
//         })),
//         { transaction: t },
//       );
//     }

//     await t.commit();

//     return res.status(201).json({
//       success: true,
//       message: "Product created successfully with images",
//       productId: product.id,
//     });
//   } catch (error) {
//     await t.rollback();

//     console.error("CREATE PRODUCT ERROR:", error);

//     console.error("CREATE PRODUCT ERROR FULL:", error);

//     return res.status(500).json({
//       success: false,
//       message: error?.message || "Product creation failed",
//       error: error?.errors || null, // Sequelize validation errors
//     });
//   }
// };






const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const sequelize = require("../../config/db");

const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");
const ProductSpec = require("../../models/products/productSpec.model");
const ProductVariant = require("../../models/productVariants/productVariant.model");
const VariantImage = require("../../models/productVariants/variantImage.model");
const VariantSize = require("../../models/productVariants/variantSize.model");
const OfferApplicableProduct = require("../../models/offers/offerApplicableProduct.model");
const { calculatePrice } = require("../../services/price.service");

/* ---------------- SAFE JSON PARSER ---------------- */
const parseJSON = (data, fieldName) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    throw new Error(`Invalid JSON format in "${fieldName}"`);
  }
};

exports.createProduct = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    console.log("FILES RECEIVED:", req.files); // 🔥 debug

    const {
      title,
      brandName,
      categoryId,
      subCategoryId,
      productCode,
      productType,
      description,
      badge,
      price,
      specs,
      variants,
      appliedOffers,
    } = req.body;

    if (!title || !categoryId || !subCategoryId) {
      throw new Error("Missing required product fields");
    }
    //nbhg
    const parsedPrice = parseJSON(price, "price");
    const parsedSpecs = parseJSON(specs, "specs");
    const parsedVariants = parseJSON(variants, "variants");
    const parsedAppliedOffers = appliedOffers
      ? parseJSON(appliedOffers, "appliedOffers")
      : [];

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      throw new Error("At least one variant is required");
    }

    /* -------- MAP VARIANT IMAGES -------- */
    const variantImagesMap = {};

    for (const file of req.files || []) {
      const match = file.fieldname.match(/^variantImages_(\d+)$/);
      if (!match) continue;

      const index = Number(match[1]);

      if (!variantImagesMap[index]) variantImagesMap[index] = [];

      if (variantImagesMap[index].length >= 5) {
        throw new Error(`Max 5 images allowed for variant ${index}`);
      }

      const imagePath = `/uploads/products/${file.filename}`;
      variantImagesMap[index].push(imagePath);
    }
    // if (gstRate === undefined || gstRate === null) {
    //   throw new Error("GST rate is required");
    // }
    // const numericGst = Number(gstRate);

    // if (isNaN(numericGst)) {
    //   throw new Error("Invalid GST rate");
    // }
    /* ---------------- CREATE PRODUCT ---------------- */

    if (!productCode) {
      throw new Error("Product code is required");
    }
    const existingCode = await Product.findOne({
      where: { productCode },
    });

    if (existingCode) {
      throw new Error("Product code already exists");
    }

    //QR Code generate
    const qrFolder = path.join(__dirname, "../../../uploads/qrcodes");

    if (!fs.existsSync(qrFolder)) {
      fs.mkdirSync(qrFolder, { recursive: true });
    }

    const safeFileName = productCode.replace(/[\/\\]/g, "-");

    const qrFileName = `${safeFileName}.png`;

    const qrAbsolutePath = path.join(qrFolder, qrFileName);

    await QRCode.toFile(qrAbsolutePath, productCode);

    const product = await Product.create(
      {
        title,
        productCode,
        brandName,
        productType: productType || "READYMADE",
        categoryId: Number(categoryId),
        subCategoryId: Number(subCategoryId),
        // productCategoryId: Number(productCategoryId),
        description,
        badge,
        qrCode: `/uploads/qrcodes/${qrFileName}`,
      },
      { transaction: t },
    );

    const calculatedPrice = calculatePrice({
      mrp: parsedPrice.mrp,
      sellingPrice: parsedPrice.sellingPrice,
      discountPercentage: parsedPrice.discountPercentage,
    });

    await ProductPrice.upsert(
      {
        productId: product.id,
        mrp: calculatedPrice.mrp,
        sellingPrice: calculatedPrice.sellingPrice,
        discountPercentage: calculatedPrice.discountPercentage,
        currency: parsedPrice.currency || "INR",
      },
      { transaction: t },
    );

    /* ---------------- SPECS ---------------- */
    const specRows = Object.keys(parsedSpecs).map((key) => ({
      productId: product.id,
      specKey: key,
      specValue: Array.isArray(parsedSpecs[key])
        ? parsedSpecs[key].join(", ")
        : parsedSpecs[key],
    }));

    if (specRows.length) {
      await ProductSpec.bulkCreate(specRows, { transaction: t });
    }

    /* ---------------- VARIANTS ---------------- */
    for (let i = 0; i < parsedVariants.length; i++) {
      const v = parsedVariants[i];

      const variant = await ProductVariant.create(
        {
          productId: product.id,
          variantCode: v.variantCode,
          colorName: v.color?.name,
          colorCode: v.color?.code,
          // swatch: v.color?.swatch || null,
          // totalStock: v.totalStock || 0,
          // stockStatus: v.stockStatus || "Out of Stock",
        },
        { transaction: t },
      );

      /* -------- IMAGES -------- */
      const images = variantImagesMap[i] || [];

      if (images.length) {
        await VariantImage.bulkCreate(
          images.map((img) => ({
            variantId: variant.id,
            imageUrl: img,
          })),
          { transaction: t },
        );
      }

      /* -------- SIZES -------- */

      if (Array.isArray(v.sizes) && v.sizes.length) {
        let variantSizes = [];

        // ================= READYMADE =================
        if (product.productType === "READYMADE") {
          variantSizes = v.sizes.map((s) => ({
            variantId: variant.id,
            sizeMasterId: s.sizeMasterId,
            stock: s.stock || 0,
          }));

          // auto total stock calculation
          const totalStock = variantSizes.reduce(
            (sum, item) => sum + Number(item.stock),
            0,
          );

          await variant.update({
            totalStock,
            stockStatus: totalStock > 0 ? "In Stock" : "Out of Stock",
          },
            { transaction: t }
        );
        }

        // ================= CUSTOMIZED =================
        else if (product.productType === "CUSTOMIZED") {
          // all sizes available
          variantSizes = v.sizes.map((s) => ({
            variantId: variant.id,
            sizeMasterId: s.sizeMasterId,
            stock: 1,
          }));

          // single design product
          await variant.update({
            totalStock: 1,
            stockStatus: "In Stock",
          },
            { transaction: t }
        );
        }

        await VariantSize.bulkCreate(variantSizes, { transaction: t });
      }
    }

    /* ---------------- OFFERS ---------------- */
    if (parsedAppliedOffers.length) {
      await OfferApplicableProduct.bulkCreate(
        parsedAppliedOffers.map((o) => ({
          productId: product.id,
          offerId: o.offerId,
          subOfferId: o.subOfferId,
        })),
        { transaction: t },
      );
    }

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Product created successfully with images",
      productId: product.id,
    });
  } catch (error) {
    await t.rollback();

    console.error("CREATE PRODUCT ERROR:", error);

    console.error("CREATE PRODUCT ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Product creation failed",
      error: error?.errors || null, // Sequelize validation errors
    });
  }
};
