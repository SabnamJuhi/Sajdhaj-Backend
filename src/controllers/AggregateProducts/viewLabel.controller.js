const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const Product = require("../../models/products/product.model");
const ProductPrice = require("../../models/products/price.model");

exports.viewLabel = async (req, res) => {
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

    const pdfPath = path.join(
      __dirname,
      `../../../uploads/labels/label-${Date.now()}.pdf`
    );

    const folder = path.dirname(pdfPath);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const PAGE_WIDTH = 150;
    const PAGE_HEIGHT = 190;

    const doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margin: 0,
    });

    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    const fontPath = path.join(
      process.cwd(),
      "assets/fonts/Roboto-Regular.ttf"
    );

    const hasCustomFont = fs.existsSync(fontPath);

    if (hasCustomFont) {
      doc.font(fontPath);
    }

    const qrPath = path.join(
      __dirname,
      "../../..",
      product.qrCode
    );

    doc
      .fontSize(12)
      .text("SAJDHAJ CREATIONS", 0, 20, {
        width: PAGE_WIDTH,
        align: "center",
      });

    const qrSize = 70;
    const qrX = (PAGE_WIDTH - qrSize) / 2;
    const qrY = 40;

    if (fs.existsSync(qrPath)) {
      doc.image(qrPath, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });
    }

    doc
      .fontSize(10)
      .text(product.productCode, 0, qrY + qrSize + 5, {
        width: PAGE_WIDTH,
        align: "center",
      });

    const formatPrice = (amount) =>
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }).format(Number(amount || 0));

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
      // Open in browser instead of download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");

      return res.sendFile(pdfPath);
    });
  } catch (error) {
    console.error("VIEW LABEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};