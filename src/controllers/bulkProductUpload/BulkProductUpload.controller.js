const xlsx = require("xlsx");
const sequelize = require("../../config/db");

const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");
const ProductSpec = require("../../models/products/productSpec.model");
const ProductVariant = require("../../models/productVariants/productVariant.model");
const VariantSize = require("../../models/productVariants/variantSize.model");
const VariantImage = require("../../models/productVariants/variantImage.model");

exports.bulkCreateProductsFromExcel = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    if (!req.file) throw new Error("Excel file required");

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) throw new Error("Excel is empty");

    const productCache = {};
    const variantCache = {};

    for (const row of rows) {

      const {
        title,
        brandName,
        categoryId,
        subCategoryId,
        productCategoryId,
        description,
        badge,
        gstRate,
        mrp,
        sellingPrice,
        specs,
        variantCode,
        colorName,
        colorCode,
        colorSwatch,
        size,
        stock,
        chest,
        // imageUrls
      } = row;

      if (!title || !categoryId || !subCategoryId || !productCategoryId)
        throw new Error(`Missing fields for ${title}`);

      let product;

      /* ---------------- PRODUCT ---------------- */

      if (!productCache[title]) {

        product = await Product.create({
          title,
          brandName,
          categoryId,
          subCategoryId,
          productCategoryId,
          description,
          badge,
          gstRate
        }, { transaction: t });

        productCache[title] = product;

        /* -------- PRICE -------- */

        await ProductPrice.create({
          productId: product.id,
          mrp,
          sellingPrice,
          discountPercentage:
            mrp > sellingPrice
              ? Math.round(((mrp - sellingPrice) / mrp) * 100)
              : 0,
          currency: "INR"
        }, { transaction: t });

        /* -------- SPECS JSON -------- */

        if (specs) {

          let parsedSpecs = specs;

          if (typeof specs === "string") {
            parsedSpecs = JSON.parse(specs);
          }

          const specRows = Object.entries(parsedSpecs).map(([key, value]) => ({
            productId: product.id,
            specKey: key,
            specValue: String(value)
          }));

          await ProductSpec.bulkCreate(specRows, { transaction: t });
        }

      } else {
        product = productCache[title];
      }

      /* ---------------- VARIANT ---------------- */

      let variant;

      const variantKey = `${product.id}_${variantCode}`;

      if (!variantCache[variantKey]) {

        variant = await ProductVariant.create({
          productId: product.id,
          variantCode,
          colorName,
          colorCode,
          colorSwatch,
          totalStock: stock || 0,
          stockStatus: stock > 0 ? "In Stock" : "Out of Stock"
        }, { transaction: t });

        variantCache[variantKey] = variant;

        // /* -------- IMAGES -------- */

        // if (imageUrls) {

        //   const urls = imageUrls.split(",");

        //   await VariantImage.bulkCreate(
        //     urls.map(url => ({
        //       variantId: variant.id,
        //       imageUrl: url.trim()
        //     })),
        //     { transaction: t }
        //   );
        // }

      } else {
        variant = variantCache[variantKey];
      }

      /* ---------------- SIZE ---------------- */

      await VariantSize.create({
        variantId: variant.id,
        size,
        stock: stock || 0,
        chest: chest || null
      }, { transaction: t });

    }

    await t.commit();

    res.json({
      success: true,
      message: "Bulk upload completed"
    });

  } catch (error) {

    await t.rollback();

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};