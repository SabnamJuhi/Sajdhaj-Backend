// const path = require("path");
// const fs = require("fs");
// const PDFDocument = require("pdfkit");
// const bwipjs = require("bwip-js");

// const Product = require("../../models/products/product.model");
// const ProductPrice = require("../../models/products/price.model");
// const ProductVariant = require("../../models/productVariants/productVariant.model");
// const VariantSize = require("../../models/productVariants/variantSize.model");
// const SizeMaster = require("../../models/products/sizeMaster.model");

// exports.printLabel = async (req, res) => {
//   try {
//     const { productId, variantId, sizeId } = req.params;

//     const product = await Product.findByPk(productId, {
//       include: [
//         {
//           model: ProductPrice,
//           as: "price",
//         },
//       ],
//     });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     const variant = await ProductVariant.findByPk(variantId);

//     // const size = await VariantSize.findOne({
//     //   where: {
//     //     variantId,
//     //     sizeMasterId: sizeId,
//     //   },
//     //   include: [
//     //     {
//     //       model: SizeMaster,
//     //       as: "sizeMaster",
//     //     },
//     //   ],
//     // });

//     // barcode image
//     const barcodeBuffer = await bwipjs.toBuffer({
//       bcid: "code128",
//       text: product.productCode,
//       scale: 2,
//       height: 10,
//       includetext: true,
//     });

//     const pdfPath = path.join(
//       __dirname,
//       `../../../uploads/labels/label-${Date.now()}.pdf`,
//     );

//     const folder = path.dirname(pdfPath);

//     if (!fs.existsSync(folder)) {
//       fs.mkdirSync(folder, { recursive: true });
//     }
//     // const doc = new PDFDocument({
//     //   size: [200, 280], // small tag size
//     //   margin: 10,
//     // });
//     const doc = new PDFDocument({
//       size: [170, 220], // smaller tag size
//       margin: 0,
//     });

//     const fontPath = path.join(
//       process.cwd(),
//       "assets/fonts/Roboto-Regular.ttf",
//     );

//     if (fs.existsSync(fontPath)) {
//       doc.font(fontPath);
//     }

//     const stream = fs.createWriteStream(pdfPath);

//     doc.pipe(stream);

//    // =====================
// // BRAND NAME
// // =====================

// doc
//   .font(fontPath)
//   .fontSize(14)
//   .text("SAJDHAJ CREATIONS", 0, 15, {
//     width: 170,
//     align: "center",
//   });

// // =====================
// // QR CODE
// // =====================

// const qrSize = 75;

// const qrX = (170 - qrSize) / 2;
// const qrY = 40;

// if (fs.existsSync(qrPath)) {
//   doc.image(qrPath, qrX, qrY, {
//     width: qrSize,
//     height: qrSize,
//   });
// }

// // =====================
// // PRODUCT CODE
// // =====================

// doc
//   .font(fontPath)
//   .fontSize(11)
//   .text(
//     product.productCode,
//     0,
//     qrY + qrSize + 8,
//     {
//       width: 170,
//       align: "center",
//     }
//   );

// // =====================
// // PRICE
// // =====================

// const formatPrice = (amount) => {
//   return new Intl.NumberFormat("en-IN", {
//     maximumFractionDigits: 0,
//   }).format(Number(amount || 0));
// };

// doc
//   .font(fontPath)
//   .fontSize(15)
//   .text(
//     `Sale Price : ₹${formatPrice(product.price?.sellingPrice)}`,
//     0,
//     qrY + qrSize + 35,
//     {
//       width: 170,
//       align: "center",
//     }
//   );
//     doc.end();

//     stream.on("finish", () => {
//       return res.json({
//         success: true,
//         pdfUrl: `/uploads/labels/${path.basename(pdfPath)}`,
//       });
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };




const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");

exports.printLabel = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: ProductPrice,
          as: "price",
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==========================
    // PDF LOCATION
    // ==========================

    const pdfPath = path.join(
      __dirname,
      `../../../uploads/labels/label-${Date.now()}.pdf`
    );

    const folder = path.dirname(pdfPath);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // ==========================
    // SMALL TAG SIZE
    // ==========================

    const PAGE_WIDTH = 150;
    const PAGE_HEIGHT = 190;

    const doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margin: 0,
    });

    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // ==========================
    // FONT
    // ==========================

    const fontPath = path.join(
      process.cwd(),
      "assets/fonts/Roboto-Regular.ttf"
    );

    const hasCustomFont = fs.existsSync(fontPath);

    if (hasCustomFont) {
      doc.font(fontPath);
    }

    // ==========================
    // QR IMAGE PATH
    // ==========================

    const qrPath = path.join(
      __dirname,
      "../../..",
      product.qrCode
    );

    // ==========================
    // BRAND NAME
    // ==========================

    if (hasCustomFont) {
      doc.font(fontPath);
    } else {
      doc.font("Helvetica-Bold");
    }

    doc
      .fontSize(12)
      .text(
        "SAJDHAJ CREATIONS",
        0,
        20,
        {
          width: PAGE_WIDTH,
          align: "center",
        }
      );

    // ==========================
    // QR CODE
    // ==========================

    const qrSize = 70;
    const qrX = (PAGE_WIDTH - qrSize) / 2;
    const qrY = 40;

    if (fs.existsSync(qrPath)) {
      doc.image(qrPath, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });
    }

    // ==========================
    // PRODUCT CODE
    // ==========================

    doc
      .fontSize(10)
      .text(
        product.productCode,
        0,
        qrY + qrSize + 5,
        {
          width: PAGE_WIDTH,
          align: "center",
        }
      );

    // ==========================
    // PRICE FORMAT
    // ==========================

    const formatPrice = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }).format(Number(amount || 0));
    };

    // ==========================
    // SALE PRICE
    // ==========================

    doc
      .fontSize(13)
      .text(
        `Sale Price : ₹${formatPrice(
          product.price?.sellingPrice || 0
        )}`,
        0,
        qrY + qrSize + 25,
        {
          width: PAGE_WIDTH,
          align: "center",
        }
      );

    doc.end();

    stream.on("finish", () => {
      return res.download(
        pdfPath,
        `label-${product.productCode}.pdf`
      );
    });

    stream.on("error", (err) => {
      throw err;
    });

  } catch (error) {
    console.error("PRINT LABEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};