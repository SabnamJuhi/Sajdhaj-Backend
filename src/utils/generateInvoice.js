
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// /* -------- Currency Formatter -------- */
// // Modified to use the built-in INR currency formatting
// const formatPrice = (amount) => {
//   const num = Number(amount || 0);
//   return new Intl.NumberFormat("en-IN", {
//     maximumFractionDigits: 0,
//   }).format(num);
// };

// exports.generateInvoice = async (order, items, address) => {
//   return new Promise((resolve, reject) => {
//     const invoiceDir = path.join(process.cwd(), "storage/invoices");
//     if (!fs.existsSync(invoiceDir)) {
//       fs.mkdirSync(invoiceDir, { recursive: true });
//     }

//     const invoicePath = path.join(
//       invoiceDir,
//       `invoice-${order.orderNumber}.pdf`
//     );

//     const doc = new PDFDocument({ 
//       margin: 40,
//       size: 'A4'
//     });
//     const stream = fs.createWriteStream(invoicePath);

//     doc.pipe(stream);

//     /* ---------------- FONT REGISTRATION ---------------- */
//     // CRITICAL: You must provide a path to a .ttf file that supports the Rupee symbol
//     const fontPath = path.join(process.cwd(), "assets/fonts/Roboto-Regular.ttf");
    
//     if (fs.existsSync(fontPath)) {
//       doc.font(fontPath); // Set the global font to Roboto
//     } else {
//       console.warn("Font file not found at " + fontPath + ". Rupee symbol may not render.");
//     }

//     /* ---------------- LOGO ---------------- */
//     const logoPath = path.join(process.cwd(), "storage/logo.jpg");
//     if (fs.existsSync(logoPath)) {
//       doc.image(logoPath, 40, 35, { width: 60 });
//     }

//     /* ---------------- HEADER ---------------- */
//     doc
//       .fontSize(20)
//       .text("SAJDHAJ", 120, 40)
//       .fontSize(10)
//       .text("Sajdhaj Fashion Pvt Ltd, India", 120, 65)
//       .text("Contact: support@sajdhaj.com | +91 XXXXX XXXXX", 120, 80)
//       .text("GSTIN: 22AAAAA0000A125", 120, 95);

//     doc
//       .fontSize(12)
//       .text(`Invoice #: ${order.orderNumber}`, 400, 40)
//       .text(`Invoice Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 400, 60);

//     doc.moveDown(3);

//     /* ---------------- ORDER INFO ---------------- */
//     doc
//       .fontSize(11)
//       .text(`Order ID: ${order.orderNumber}`)
//       .text(`Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`);

//     doc.moveDown();

//     /* ---------------- ADDRESS ---------------- */
//     const billingTop = doc.y;

//     doc
//       .fontSize(12)
//       .text("Billing Address", 40, billingTop, { underline: true });

//     doc
//       .fontSize(10)
//       .text(address.fullName, 40, billingTop + 15)
//       .text(address.addressLine, 40, billingTop + 30)
//       .text(`${address.city}, ${address.state} ${address.zipCode}`, 40, billingTop + 45)
//       .text(`Phone: ${address.phoneNumber}`, 40, billingTop + 60);

//     doc
//       .fontSize(12)
//       .text("Shipping Address", 300, billingTop, { underline: true });

//     doc
//       .fontSize(10)
//       .text(address.fullName, 300, billingTop + 15)
//       .text(address.addressLine, 300, billingTop + 30)
//       .text(`${address.city}, ${address.state} ${address.zipCode}`, 300, billingTop + 45)
//       .text(`Phone: ${address.phoneNumber}`, 300, billingTop + 60);

//     doc.moveDown(8);

//     /* ---------------- TABLE HEADER ---------------- */
//     const tableTop = doc.y;
//     doc.rect(40, tableTop - 5, 520, 20).fill('#f0f0f0');
    
//     doc
//       .fontSize(10)
//       .fillColor('black')
//       .text("#", 45, tableTop)
//       .text("Product", 70, tableTop)
//       .text("HSN", 250, tableTop)
//       .text("Qty", 320, tableTop, { width: 40, align: "right" })
//       .text("Price", 370, tableTop, { width: 60, align: "right" })
//       // .text("Tax", 430, tableTop, { width: 60, align: "right" })
//       .text("Total", 490, tableTop, { width: 60, align: "right" });

//     let position = tableTop + 25;
//     let itemCount = 0;
//     let calculatedSubtotal = 0;
//     // let calculatedTax = 0;
//     let calculatedTotal = 0;

//     /* ---------------- ITEMS ---------------- */
//     items.forEach((item) => {
//       itemCount++;
//       const quantity = Number(item.quantity || 1);
//       const sellingPrice = Number(item.sellingPrice || item.priceAtPurchase || item.price || 0);
//       // const gstRate = Number(item.gstRate || 0);
//       // const gstAmount = Number(item.gstAmount || (sellingPrice * quantity * gstRate / 100) || 0);
//       const itemTotal = Number(item.finalPrice || (sellingPrice * quantity + gstAmount) || 0);
      
//       calculatedSubtotal += (sellingPrice * quantity);
//       // calculatedTax += gstAmount;
//       calculatedTotal += itemTotal;

//       if (position > 700) {
//         doc.addPage();
//         position = 60;
//         doc.rect(40, position - 5, 520, 20).fill('#f0f0f0');
//         // Redraw table headers on new page...
//         position += 25;
//       }

//       if (itemCount % 2 === 0) {
//         doc.rect(40, position - 5, 520, 20).fill('#f9f9f9');
//       }

//       doc.fillColor('black');
//       doc.text(itemCount.toString(), 45, position);
//       doc.text(item.productName || "Product", 70, position, { width: 170, ellipsis: true });
//       doc.text(item.hsnCode || "6104", 250, position);
//       doc.text(quantity.toString(), 320, position, { width: 40, align: "right" });
      
//       // FIXED: Using standard Unicode Rupee symbol
//       doc.text(`₹${formatPrice(sellingPrice)}`, 370, position, { width: 60, align: "right" });
//       // doc.text(`₹${formatPrice(gstAmount)}`, 430, position, { width: 60, align: "right" });
//       doc.text(`₹${formatPrice(itemTotal)}`, 490, position, { width: 60, align: "right" });

//       position += 22;
//     });

//     /* ---------------- TOTALS ---------------- */
//     const summaryTop = position + 30;
//     doc.moveTo(350, summaryTop - 10).lineTo(550, summaryTop - 10).stroke();

//     const subtotal = order.subtotal || calculatedSubtotal;
//     // const tax = order.taxAmount || calculatedTax;
//     const shipping = order.shippingFee || 50;
//     const grandTotal = order.totalAmount || (calculatedTotal + shipping);

//     doc
//       .fontSize(11)
//       .text("Subtotal:", 350, summaryTop)
//       .text(`₹${formatPrice(subtotal)}`, 470, summaryTop, { align: "right" })
//       // .text("Tax:", 350, summaryTop + 20)
//       // .text(`₹${formatPrice(tax)}`, 470, summaryTop + 20, { align: "right" })
//       .text("Shipping:", 350, summaryTop + 40)
//       .text(`₹${formatPrice(shipping)}`, 470, summaryTop + 40, { align: "right" });

//     const grandTotalTop = summaryTop + 70;
//     doc.rect(340, grandTotalTop - 5, 220, 30).fill('#f0f0f0');
//     doc
//       .fontSize(14)
//       .fillColor('black')
//       .text("Grand Total:", 350, grandTotalTop)
//       .text(`₹${formatPrice(grandTotal)}`, 470, grandTotalTop, { align: "right" });

//     /* ---------------- FOOTER ---------------- */
//     doc
//       .fontSize(9)
//       .fillColor('#666666')
//       .text("This is a computer generated invoice. No signature required.", 40, doc.page.height - 50, { align: "center", width: 520 });

//     doc.end();
//     stream.on("finish", () => resolve(invoicePath));
//     stream.on("error", reject);
//   });
// };












const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/* -------- Currency Formatter -------- */
const formatPrice = (amount) => {
  const num = Number(amount || 0);

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(num);
};

exports.generateInvoice = async (order, items, address) => {
  return new Promise((resolve, reject) => {
    const invoiceDir = path.join(process.cwd(), "storage/invoices");

    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoicePath = path.join(
      invoiceDir,
      `invoice-${order.orderNumber}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    const stream = fs.createWriteStream(invoicePath);

    doc.pipe(stream);

    /* ---------------- FONT ---------------- */

    const fontPath = path.join(
      process.cwd(),
      "assets/fonts/Roboto-Regular.ttf"
    );

    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
    } else {
      console.warn(
        "Font file not found. Rupee symbol may not render properly."
      );
    }

    /* ---------------- LOGO ---------------- */

    const logoPath = path.join(process.cwd(), "storage/logo.jpg");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 35, { width: 60 });
    }

    /* ---------------- HEADER ---------------- */

    doc
      .fontSize(20)
      .text("SAJDHAJ", 120, 40)
      .fontSize(10)
      .text("Sajdhaj Fashion Pvt Ltd, India", 120, 65)
      .text("Contact: sajdhajc@gmail.com | +91 XXXXX XXXXX", 120, 80)
      .text("Invoice", 120, 95);

    doc
      .fontSize(12)
      .text(`Invoice #: ${order.orderNumber}`, 400, 40)
      .text(
        `Invoice Date: ${new Date(
          order.createdAt || Date.now()
        ).toLocaleDateString("en-IN")}`,
        400,
        60
      );

    doc.moveDown(3);

    /* ---------------- ORDER INFO ---------------- */

    doc
      .fontSize(11)
      .text(`Order ID: ${order.orderNumber}`)
      .text(
        `Order Date: ${new Date(
          order.createdAt || Date.now()
        ).toLocaleDateString("en-IN")}`
      );

    doc.moveDown();

    /* ---------------- ADDRESS ---------------- */

    const billingTop = doc.y;

    doc
      .fontSize(12)
      .text("Billing Address", 40, billingTop, {
        underline: true,
      });

    doc
      .fontSize(10)
      .text(address.fullName, 40, billingTop + 15)
      .text(address.addressLine, 40, billingTop + 30)
      .text(
        `${address.city}, ${address.state} ${address.zipCode}`,
        40,
        billingTop + 45
      )
      .text(`Phone: ${address.phoneNumber}`, 40, billingTop + 60);

    doc
      .fontSize(12)
      .text("Shipping Address", 300, billingTop, {
        underline: true,
      });

    doc
      .fontSize(10)
      .text(address.fullName, 300, billingTop + 15)
      .text(address.addressLine, 300, billingTop + 30)
      .text(
        `${address.city}, ${address.state} ${address.zipCode}`,
        300,
        billingTop + 45
      )
      .text(`Phone: ${address.phoneNumber}`, 300, billingTop + 60);

    doc.moveDown(8);

    /* ---------------- TABLE HEADER ---------------- */

const tableTop = doc.y;

doc.rect(40, tableTop - 5, 520, 20).fill("#f0f0f0");

doc
  .fontSize(10)
  .fillColor("black")
  .text("#", 45, tableTop)
  .text("Product", 70, tableTop)
  .text("HSN", 280, tableTop)
  .text("Qty", 350, tableTop, {
    width: 40,
    align: "right",
  })
  .text("Price", 410, tableTop, {
    width: 60,
    align: "right",
  })
  .text("Total", 490, tableTop, {
    width: 60,
    align: "right",
  });

let position = tableTop + 25;

let itemCount = 0;

let calculatedOriginalPrice = 0;
let calculatedSubtotal = 0;

/* ---------------- ITEMS ---------------- */

items.forEach((item) => {
  itemCount++;

  const quantity = Number(item.quantity || 1);

  // SINGLE PRODUCT PRICE
  const productPrice = Number(item.sellingPrice || 0);

  // TOTAL PRODUCT PRICE
  const productTotal = Number(item.totalSellingPrice || 0);

  calculatedOriginalPrice += productTotal;
  calculatedSubtotal += productTotal;

  /* ---------- PAGE BREAK ---------- */

  if (position > 700) {
    doc.addPage();

    position = 60;

    doc.rect(40, position - 5, 520, 20).fill("#f0f0f0");

    doc
      .fontSize(10)
      .fillColor("black")
      .text("#", 45, position)
      .text("Product", 70, position)
      .text("HSN", 280, position)
      .text("Qty", 350, position, {
        width: 40,
        align: "right",
      })
      .text("Price", 410, position, {
        width: 60,
        align: "right",
      })
      .text("Total", 490, position, {
        width: 60,
        align: "right",
      });

    position += 25;
  }

  /* ---------- ROW BG ---------- */

  if (itemCount % 2 === 0) {
    doc.rect(40, position - 5, 520, 20).fill("#f9f9f9");
  }

  doc.fillColor("black");

  doc.text(itemCount.toString(), 45, position);

  doc.text(item.productName || "Product", 70, position, {
    width: 190,
    ellipsis: true,
  });

  doc.text(item.hsnCode || "6104", 280, position);

  doc.text(quantity.toString(), 350, position, {
    width: 40,
    align: "right",
  });

  // PRICE
  doc.text(`₹${formatPrice(productPrice)}`, 410, position, {
    width: 60,
    align: "right",
  });

  // TOTAL
  doc.text(`₹${formatPrice(productTotal)}`, 490, position, {
    width: 60,
    align: "right",
  });

  position += 22;
});

/* ---------------- TOTALS ---------------- */

const summaryTop = position + 30;

doc
  .moveTo(350, summaryTop - 10)
  .lineTo(550, summaryTop - 10)
  .stroke();

/* ---------- ORDER TOTALS ---------- */

const totalOriginalPrice =
  Number(order.totalOriginalAmount) || calculatedOriginalPrice;

const totalDiscount =
  Number(order.totalDiscount) || 0;

const shipping =
  Number(order.shippingFee) || 0;

/*
  GRAND TOTAL WITHOUT GST
  subtotal already contains discounted amount
*/

const grandTotal =Number(order.totalAmount) || 0 ;

doc
  .fontSize(11)

  .text("Total Price:", 350, summaryTop)

  .text(`₹${formatPrice(totalOriginalPrice)}`, 470, summaryTop, {
    align: "right",
  })

  .text("Total Discount:", 350, summaryTop + 20)

  .text(`- ₹${formatPrice(totalDiscount)}`, 470, summaryTop + 20, {
    align: "right",
  })

  .text("Shipping:", 350, summaryTop + 40)

  .text(`+ ₹${formatPrice(shipping)}`, 470, summaryTop + 40, {
    align: "right",
  });

/* ---------------- GRAND TOTAL ---------------- */

const grandTotalTop = summaryTop + 75;

doc.rect(340, grandTotalTop - 5, 220, 30).fill("#f0f0f0");

doc
  .fontSize(14)
  .fillColor("black")
  .text("Grand Total:", 350, grandTotalTop)
  .text(`₹${formatPrice(grandTotal)}`, 470, grandTotalTop, {
    align: "right",
  });

    /* ---------------- FOOTER ---------------- */

    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "This is a computer generated invoice. No signature required.",
        40,
        doc.page.height - 50,
        {
          align: "center",
          width: 520,
        }
      );

    doc.end();

    stream.on("finish", () => resolve(invoicePath));

    stream.on("error", reject);
  });
};