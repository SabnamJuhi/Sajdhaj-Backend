

const { Op } = require("sequelize");
const {
  Order,
  OrderItem,
  OrderAddress,
  CartItem,
  Product,
  ProductPrice,
  ProductVariant,
  VariantSize,
  Offer,
  OfferSub,
  OfferApplicableProduct,
  sequelize,
  Coupon,
  User,
} = require("../../models");
const UserAddress = require("../../models/orders/userAddress.model");
const { calculateCartDiscount } = require("../../services/discount.service");
const { generateOrderNumber } = require("../../utils/helpers");
const {
  encrypt,
  decrypt,
  generateChecksum,
} = require("../../utils/iciciCrypto");
const CartCoupon = require("../../models/offers/cartCoupon.model");
const ShippingSetting = require("../../models/shippingFee/shipping.model");
const { generateInvoice } = require("../../utils/generateInvoice");
const { sendInvoiceEmail } = require("../../utils/email");



// exports.placeOrder = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const userId = req.user.id;
//     const { addressId, paymentMethod, couponCode } = req.body;
//     const now = new Date();

//     // Validation
//     if (!addressId) {
//       throw new Error("Address is required");
//     }
//     if (!userId) {
//       throw new Error("user not exist");
//     }
//     if (!paymentMethod) {
//       throw new Error("Payment method is required");
//     }

//     const user = await User.findByPk(userId, {
//       attributes: ["id", "email"],
//       transaction: t,
//     });
//     if (!user) {
//       throw new Error("User not found");
//     }

//     // 0️⃣ Fetch Shipping Settings (STATIC FEE FROM ADMIN)
//     let shippingSettings = await ShippingSetting.findOne({
//       transaction: t,
//     });
//     if (!shippingSettings) {
//       shippingSettings = await ShippingSetting.create(
//         {
//           shippingFee: 50,
//         },
//         { transaction: t },
//       );
//     }
//     const STATIC_SHIPPING_FEE = Number(shippingSettings.shippingFee);

//     // 1️⃣ Fetch User Address
//     const userAddress = await UserAddress.findOne({
//       where: { id: addressId, userId },
//       transaction: t,
//       lock: t.LOCK.UPDATE,
//     });

//     if (!userAddress) {
//       throw new Error("Invalid address selected");
//     }

//     // 2️⃣ Fetch Cart Items
//     const cartItems = await CartItem.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Product,
//           as: "product",
//           include: [{ model: ProductPrice, as: "price" }],
//         },
//         { model: ProductVariant, as: "variant" },
//         { model: VariantSize, as: "variantSize" },
//       ],
//       transaction: t,
//       lock: t.LOCK.UPDATE,
//     });

//     if (!cartItems.length) {
//       throw new Error("Cart is empty");
//     }

//     // 3️⃣ Check stock availability
//     for (const item of cartItems) {
//       const currentStock = item.variantSize?.stock || 0;
//       if (currentStock < item.quantity) {
//         throw new Error(
//           `Insufficient stock for ${item.product?.title || "product"}. Available: ${currentStock}`,
//         );
//       }
//     }

//     // 4️⃣ Fetch Active Offers
//     const activeOffers = await Offer.findAll({
//       where: {
//         isActive: true,
//         startDate: { [Op.lte]: now },
//         endDate: { [Op.gte]: now },
//       },
//       include: [
//         { model: OfferSub, as: "subOffers" },
//         { model: OfferApplicableProduct, as: "offerApplicableProducts" },
//       ],
//       transaction: t,
//     });

//     // 5️⃣ Process Cart Items with Offers (MODIFIED)
//     let totalOriginalAmount = 0;
//     let productOfferDiscount = 0;
//     let subTotal = 0;
//     let totalQuantity = 0;

//     // Track eligible amount for coupon
//     let eligibleForCouponTotal = 0;

//     const processedItems = [];

//     for (let item of cartItems) {
//       const mrp = Number(item.product?.price?.mrp || 0);
//       const sellingPrice = Number(item.product?.price?.sellingPrice || 0);
//       const discountPercentage = Number(
//         item.product?.price?.discountPercentage || 0,
//       );
//       const gstRate = Number(item.product?.gstRate || 0);
//       const quantity = item.quantity;
//       const currentStock = item.variantSize?.stock || 0;

//       const isAvailable = currentStock > 0;
//       const validQuantity = isAvailable ? Math.min(quantity, currentStock) : 0;

//       totalQuantity += validQuantity;

//       // Calculate with quantity
//       const totalMrp = mrp * validQuantity;
//       const totalSellingPrice = sellingPrice * validQuantity;

//       totalOriginalAmount += totalSellingPrice;

//       let itemOfferDiscount = 0;
//       let offerApplied = false;
//       let appliedOfferId = null;
//       let appliedSubOfferId = null;
//       let offerDiscountType = null;
//       let offerDiscountValue = null;

//       // Offer Check
//       for (let offer of activeOffers) {
//         const isProductEligible = offer.offerApplicableProducts.some(
//           (p) => p.productId === item.productId,
//         );

//         if (!isProductEligible) continue;

//         const subOffer = offer.subOffers[0];
//         if (!subOffer) continue;

//         if (totalSellingPrice < subOffer.minOrderValue) continue;

//         if (subOffer.discountType === "PERCENTAGE") {
//           let discount = (totalSellingPrice * subOffer.discountValue) / 100;
//           if (subOffer.maxDiscount) {
//             discount = Math.min(discount, subOffer.maxDiscount);
//           }
//           itemOfferDiscount = discount;
//           offerDiscountType = "PERCENTAGE";
//           offerDiscountValue = subOffer.discountValue;
//         } else if (subOffer.discountType === "FLAT") {
//           itemOfferDiscount = subOffer.discountValue;
//           offerDiscountType = "FLAT";
//           offerDiscountValue = subOffer.discountValue;
//         }

//         offerApplied = true;
//         appliedOfferId = offer.id;
//         appliedSubOfferId = subOffer.id;
//         break;
//       }

//       const finalAmount = totalSellingPrice - itemOfferDiscount;

//       if (isAvailable) {
//         subTotal += finalAmount;
//         productOfferDiscount += itemOfferDiscount;

//         // Track eligible amount for coupon (only items without offer)
//         if (!offerApplied) {
//           eligibleForCouponTotal += totalSellingPrice;
//         }
//       }

//       processedItems.push({
//         // Basic Info
//         productId: item.productId,
//         variantId: item.variantId,
//         sizeId: item.sizeId,
//         productName: item.product?.title || "Unknown Product",
//         variantInfo: {
//           colorName: item.variant?.colorName,
//           colorCode: item.variant?.colorCode,
//           swatch: item.variant?.swatch,
//           size: item.variantSize?.size,
//         },

//         // Base Pricing
//         mrp,
//         sellingPrice,
//         discountPercentage,
//         quantity: validQuantity,

//         // Totals with Quantity
//         totalMrp,
//         totalSellingPrice,

//         // Offer Details
//         offerId: appliedOfferId,
//         subOfferId: appliedSubOfferId,
//         offerDiscountType,
//         offerDiscountValue,
//         offerDiscountAmount: itemOfferDiscount,
//         offerApplied,

//         // After Offer
//         finalAmount,

//         // GST
//         gstRate,
//       });
//     }

//     // 6️⃣ Calculate Coupon Discount (based on eligible items only)
//     let couponDiscount = 0;
//     let appliedCouponCode = null;

//     if (couponCode && eligibleForCouponTotal > 0) {
//       const coupon = await Coupon.findOne({
//         where: {
//           code: couponCode,
//           isActive: true,
//           startDate: { [Op.lte]: now },
//           endDate: { [Op.gte]: now },
//         },
//         transaction: t,
//       });

//       if (coupon) {
//         const minCartValue = Number(coupon.minCartValue || 0);

//         if (eligibleForCouponTotal >= minCartValue) {
//           appliedCouponCode = coupon.code;

//           if (coupon.discountType === "PERCENTAGE") {
//             let discount =
//               (eligibleForCouponTotal * Number(coupon.discountValue || 0)) /
//               100;
//             if (coupon.maxDiscount) {
//               discount = Math.min(discount, Number(coupon.maxDiscount));
//             }
//             couponDiscount = discount;
//           } else if (coupon.discountType === "FLAT") {
//             const flatDiscount = Number(coupon.discountValue || 0);
//             couponDiscount = Math.min(flatDiscount, eligibleForCouponTotal);
//           }
//         }
//       }
//     }

//     // 7️⃣ Apply Coupon and Calculate Final Values
//     let taxAmount = 0;
//     const finalProcessedItems = [];

//     for (let item of processedItems) {
//       let itemCouponDiscount = 0;

//       // Apply coupon only to eligible items proportionally
//       if (
//         appliedCouponCode &&
//         !item.offerApplied &&
//         eligibleForCouponTotal > 0
//       ) {
//         const proportion = item.totalSellingPrice / eligibleForCouponTotal;
//         itemCouponDiscount = couponDiscount * proportion;
//       }

//       // Calculate subtotal (price after offer and coupon)
//       const subtotal = item.finalAmount - itemCouponDiscount;

//       // Calculate total discount
//       const totalDiscount = item.offerDiscountAmount + itemCouponDiscount;

//       // Calculate GST
//       const gstAmount = Math.round((subtotal * item.gstRate) / 100);
//       taxAmount += gstAmount;

//       // Final price with GST
//       const finalPrice = subtotal + gstAmount;

//       finalProcessedItems.push({
//         ...item,
//         couponDiscountAmount: itemCouponDiscount,
//         subtotal,
//         totalDiscount,
//         gstAmount,
//         finalPrice,
//       });
//     }

//     const finalSubTotal = subTotal - couponDiscount;

//     // 8️⃣ Calculate Shipping Fee - NOW USING STATIC FEE FROM ADMIN
//     const shippingFee = STATIC_SHIPPING_FEE;
//     const grandTotal = finalSubTotal + taxAmount + shippingFee;

//     const orderNumber = generateOrderNumber();
//     // Generate 6-digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     console.log(`OTP generated for order ${orderNumber}: ${otp}`);

//     // 🔟 Create Order (COMPLETELY UNCHANGED - YOUR EXISTING CODE)
//     const order = await Order.create(
//       {
//         orderNumber,
//         userId,
//         otp: otp,
//         otpVerified: false,

//         // Discount Breakup
//         totalOriginalAmount,
//         productOfferDiscount,
//         couponDiscount,
//         totalDiscount: productOfferDiscount + couponDiscount,
//         couponCode: appliedCouponCode,

//         // Amounts
//         subtotal: finalSubTotal,
//         shippingFee,
//         taxAmount,
//         totalAmount: grandTotal,

//         // Status
//         status: paymentMethod === "COD" ? "confirmed" : "pending",
//         paymentMethod,
//         paymentStatus: paymentMethod === "COD" ? "unpaid" : "unpaid",

//         // Timestamps
//         confirmedAt: paymentMethod === "COD" ? new Date() : null,
//       },
//       { transaction: t },
//     );

//     // 1️⃣1️⃣ Create Order Items (MODIFIED - USING NEW MODEL FIELDS)
//     const orderItems = finalProcessedItems.map((item) => ({
//       orderId: order.id,
//       productId: item.productId,
//       variantId: item.variantId,
//       sizeId: item.sizeId,

//       // Product Details
//       productName: item.productName,
//       variantInfo: item.variantInfo,

//       // Base Pricing
//       mrp: item.mrp,
//       sellingPrice: item.sellingPrice,
//       discountPercentage: item.discountPercentage,
//       quantity: item.quantity,

//       // Totals with Quantity
//       totalMrp: item.totalMrp,
//       totalSellingPrice: item.totalSellingPrice,

//       // Offer Details
//       offerId: item.offerId,
//       subOfferId: item.subOfferId,
//       offerDiscountType: item.offerDiscountType,
//       offerDiscountValue: item.offerDiscountValue,
//       offerDiscountAmount: item.offerDiscountAmount,
//       finalAmount: item.finalAmount,

//       // Coupon Details
//       couponDiscountAmount: item.couponDiscountAmount,

//       // Final Calculations
//       subtotal: item.subtotal,
//       totalDiscount: item.totalDiscount,

//       // GST
//       gstRate: item.gstRate,
//       gstAmount: item.gstAmount,
//       finalPrice: item.finalPrice,

//       // Offer Applied Flag
//       offerApplied: item.offerApplied,
//     }));

//     await OrderItem.bulkCreate(orderItems, { transaction: t });

//     // 1️⃣2️⃣ Save Address Snapshot
//     await OrderAddress.create(
//       {
//         orderId: order.id,
//         fullName: userAddress.fullName,
//         email: userAddress.email,
//         phoneNumber: userAddress.phoneNumber,
//         addressLine: userAddress.addressLine,
//         country: userAddress.country,
//         city: userAddress.city,
//         state: userAddress.state,
//         zipCode: userAddress.zipCode,
//         landmark: userAddress.landmark,
//         addressType: userAddress.addressType,
//       },
//       { transaction: t },
//     );
//     for (const item of processedItems) {
//       await Product.increment(
//         { soldCount: item.quantity },
//         {
//           where: { id: item.productId },
//           transaction: t,
//         },
//       );
//     }
//     // 1️⃣3️⃣ Handle based on Payment Method
//     if (paymentMethod === "COD") {
//       // Deduct stock
//       for (const item of processedItems) {
//         await VariantSize.decrement("stock", {
//           by: item.quantity,
//           where: { id: item.sizeId },
//           transaction: t,
//         });

//         await ProductVariant.decrement("totalStock", {
//           by: item.quantity,
//           where: { id: item.variantId },
//           transaction: t,
//         });
//       }

//       // Clear cart and coupon
//       await CartItem.destroy({ where: { userId }, transaction: t });
//       await CartCoupon.destroy({ where: { userId }, transaction: t });

//       // Commit transaction first
//       await t.commit();

//       // ✅ Generate Invoice
//       const invoicePath = await generateInvoice(
//         order,
//         finalProcessedItems,
//         userAddress,
//       );
//       console.log("Invoice generated at:", invoicePath);

//       console.log("Sending email to:", userAddress.email);

//       // Send invoice to account email + address email
//       const recipientEmails = [user.email];

//       if (userAddress.email && userAddress.email !== user.email) {
//         recipientEmails.push(userAddress.email);
//       }

//       console.log("Sending email to:", recipientEmails);

//       // await sendInvoiceEmail(recipientEmails, order.orderNumber, invoicePath);
//       await sendInvoiceEmail(
//   recipientEmails,
//   order,
//   finalProcessedItems,
//   userAddress,
//   invoicePath
// );
//       console.log("Email sent successfully");

//       return res.status(200).json({
//         success: true,
//         message: "Order placed successfully",
//         data: {
//           orderId: order.id,
//           orderNumber: order.orderNumber,
//           totalAmount: grandTotal,
//           paymentMethod: "COD",
//           paymentStatus: "unpaid",
//           status: "confirmed",
//         },
//       });
//     } else if (paymentMethod === "ICICI") {
//       await t.commit();

//       const paymentData = {
//         merchantId: process.env.ICICI_MERCHANT_ID,
//         orderNumber: order.orderNumber,
//         amount: grandTotal.toFixed(2),
//         currency: "INR",
//         returnUrl: process.env.ICICI_RETURN_URL,
//         cancelUrl: process.env.ICICI_CANCEL_URL,
//         customerName: userAddress.fullName,
//         customerEmail: userAddress.email,
//         customerMobile: userAddress.phoneNumber,
//       };

//       const payload = JSON.stringify(paymentData);
//       const encData = encrypt(payload, process.env.ICICI_ENCRYPTION_KEY);
//       const checksum = generateChecksum(
//         encData,
//         process.env.ICICI_CHECKSUM_KEY,
//       );

//       return res.status(200).json({
//         success: true,
//         message: "Order created, proceeding to payment",
//         data: {
//           orderId: order.id,
//           orderNumber: order.orderNumber,
//           totalAmount: grandTotal,
//           paymentMethod: "ICICI",
//           paymentStatus: "unpaid",
//           status: "pending",
//           paymentDetails: {
//             paymentUrl: process.env.ICICI_PAYMENT_URL,
//             encData,
//             checksum,
//             merchantId: process.env.ICICI_MERCHANT_ID,
//           },
//         },
//       });
//     } else {
//       await t.commit();

//       // ✅ Generate Invoice
//       const invoicePath = await generateInvoice(
//         order,
//         finalProcessedItems,
//         userAddress,
//       );
//       // Send invoice to account email + address email
//       const recipientEmails = [user.email];

//       if (userAddress.email && userAddress.email !== user.email) {
//         recipientEmails.push(userAddress.email);
//       }

//       console.log("Sending email to:", recipientEmails);

//       await sendInvoiceEmail(recipientEmails, order.orderNumber, invoicePath);
//       console.log("Email sent successfully");

//       return res.status(200).json({
//         success: true,
//         message: "Order created successfully",
//         data: {
//           orderId: order.id,
//           orderNumber: order.orderNumber,
//           totalAmount: grandTotal,
//           paymentMethod,
//           paymentStatus: "unpaid",
//           status: "pending",
//         },
//       });
//     }
//   } catch (error) {
//     if (t && !t.finished) {
//       await t.rollback();
//     }

//     console.error("Place Order Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong while placing order",
//     });
//   }
// };


exports.placeOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { addressId, paymentMethod, couponCode } = req.body;
    const now = new Date();

    // ================= VALIDATION =================

    if (!addressId) {
      throw new Error("Address is required");
    }

    if (!userId) {
      throw new Error("User not found");
    }

    if (!paymentMethod) {
      throw new Error("Payment method is required");
    }

    // ================= USER =================

    const user = await User.findByPk(userId, {
      attributes: ["id", "email"],
      transaction: t,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // ================= SHIPPING =================

    let shippingSettings = await ShippingSetting.findOne({
      transaction: t,
    });

    if (!shippingSettings) {
      shippingSettings = await ShippingSetting.create(
        {
          shippingFee: 50,
        },
        { transaction: t }
      );
    }

    const STATIC_SHIPPING_FEE = Number(
      shippingSettings.shippingFee || 0
    );

    // ================= ADDRESS =================

    const userAddress = await UserAddress.findOne({
      where: {
        id: addressId,
        userId,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!userAddress) {
      throw new Error("Invalid address selected");
    }

    // ================= CART ITEMS =================

    const cartItems = await CartItem.findAll({
      where: { userId },

      include: [
        {
          model: Product,
          as: "product",

          include: [
            {
              model: ProductPrice,
              as: "price",
            },

            // ✅ PRODUCT OFFERS
            {
              model: OfferApplicableProduct,
              as: "offerApplicableProducts",

              include: [
                {
                  model: Offer,
                  as: "offerDetails",

                  where: {
                    isActive: true,
                    startDate: {
                      [Op.lte]: now,
                    },
                    endDate: {
                      [Op.gte]: now,
                    },
                  },

                  required: false,

                  include: [
                    {
                      model: OfferSub,
                      as: "subOffers",
                    },
                  ],
                },
              ],
            },
          ],
        },

        {
          model: ProductVariant,
          as: "variant",
        },

        {
          model: VariantSize,
          as: "variantSize",
        },
      ],

      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!cartItems.length) {
      throw new Error("Cart is empty");
    }

    // ================= STOCK CHECK =================

    for (const item of cartItems) {
      const currentStock = Number(
        item.variantSize?.stock || 0
      );

      if (currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${
            item.product?.title || "product"
          }. Available: ${currentStock}`
        );
      }
    }

    // ================= TOTALS =================

    let totalOriginalAmount = 0;
    let productOfferDiscount = 0;
    let subTotal = 0;
    let totalQuantity = 0;

    let eligibleForCouponTotal = 0;

    const processedItems = [];

    // ================= PROCESS ITEMS =================

    for (const item of cartItems) {
      const mrp = Number(
        item.product?.price?.mrp || 0
      );

      const sellingPrice = Number(
        item.product?.price?.sellingPrice || 0
      );

      const discountPercentage = Number(
        item.product?.price?.discountPercentage || 0
      );

      const gstRate = Number(
        item.product?.gstRate || 0
      );

      const quantity = Number(item.quantity || 0);

      const currentStock = Number(
        item.variantSize?.stock || 0
      );

      const isAvailable = currentStock > 0;

      const validQuantity = isAvailable
        ? Math.min(quantity, currentStock)
        : 0;

      totalQuantity += validQuantity;

      // ================= PRICE TOTALS =================

      const totalMrp = mrp * validQuantity;

      const totalSellingPrice =
        sellingPrice * validQuantity;

      totalOriginalAmount += totalSellingPrice;

      // ================= OFFER VARIABLES =================

      let itemOfferDiscount = 0;

      let offerApplied = false;

      let appliedOfferId = null;
      let appliedSubOfferId = null;

      let offerDiscountType = null;
      let offerDiscountValue = null;

      let offerCode = null;
      let offerTitle = null;

      // =====================================================
      // ✅ FIXED OFFER LOGIC
      // =====================================================

      const applicableOffers =
        item.product?.offerApplicableProducts || [];

      for (const applicable of applicableOffers) {
        const offer = applicable.offerDetails;

        if (!offer) continue;

        // ✅ MATCH SUB OFFER CORRECTLY
        let subOffer =
          offer.subOffers?.find(
            (s) => s.id === applicable.subOfferId
          ) || offer.subOffers?.[0];

        if (!subOffer) continue;

        const minOrderValue = Number(
          subOffer.minOrderValue || 0
        );

        if (totalSellingPrice < minOrderValue) {
          continue;
        }

        let calculatedDiscount = 0;

        // ================= PERCENTAGE =================

        if (
          subOffer.discountType === "PERCENTAGE"
        ) {
          calculatedDiscount =
            (totalSellingPrice *
              Number(subOffer.discountValue || 0)) /
            100;

          const maxDiscount = Number(
            subOffer.maxDiscount || 0
          );

          if (
            maxDiscount > 0 &&
            calculatedDiscount > maxDiscount
          ) {
            calculatedDiscount = maxDiscount;
          }
        }

        // ================= FLAT =================

        else if (
          subOffer.discountType === "FLAT"
        ) {
          calculatedDiscount = Number(
            subOffer.discountValue || 0
          );

          // ✅ NEVER EXCEED ITEM TOTAL
          calculatedDiscount = Math.min(
            calculatedDiscount,
            totalSellingPrice
          );
        }

        // ✅ APPLY BEST OFFER ONLY
        if (calculatedDiscount > itemOfferDiscount) {
          itemOfferDiscount = calculatedDiscount;

          offerApplied = true;

          appliedOfferId = offer.id;

          appliedSubOfferId = subOffer.id;

          offerDiscountType =
            subOffer.discountType;

          offerDiscountValue =
            subOffer.discountValue;

          offerCode = offer.offerCode;

          offerTitle = offer.title;
        }
      }

      // ================= FINAL ITEM AMOUNT =================

      const finalAmount =
        totalSellingPrice - itemOfferDiscount;

      if (isAvailable) {
        subTotal += finalAmount;

        productOfferDiscount += itemOfferDiscount;

        // ✅ ONLY NON OFFER ITEMS ELIGIBLE
        if (!offerApplied) {
          eligibleForCouponTotal += finalAmount;
        }
      }

      // ================= STORE ITEM =================

      processedItems.push({
        productId: item.productId,

        variantId: item.variantId,

        sizeId: item.sizeId,

        productName:
          item.product?.title || "Unknown Product",

        variantInfo: {
          colorName: item.variant?.colorName,
          colorCode: item.variant?.colorCode,
          swatch: item.variant?.swatch,
          size: item.variantSize?.size,
        },

        // BASE PRICE
        mrp,
        sellingPrice,
        discountPercentage,

        quantity: validQuantity,

        // TOTALS
        totalMrp,
        totalSellingPrice,

        // OFFER
        offerId: appliedOfferId,
        subOfferId: appliedSubOfferId,

        offerCode,
        offerTitle,

        offerDiscountType,
        offerDiscountValue,

        offerDiscountAmount:
          itemOfferDiscount,

        offerApplied,

        // FINAL AFTER OFFER
        finalAmount,

        // GST
        gstRate,
      });
    }

    // =====================================================
    // COUPON
    // =====================================================

    let couponDiscount = 0;
    let appliedCouponCode = null;

    if (
      couponCode &&
      eligibleForCouponTotal > 0
    ) {
      const coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          isActive: true,

          startDate: {
            [Op.lte]: now,
          },

          endDate: {
            [Op.gte]: now,
          },
        },

        transaction: t,
      });

      if (coupon) {
        const minCartValue = Number(
          coupon.minCartValue || 0
        );

        if (
          eligibleForCouponTotal >= minCartValue
        ) {
          appliedCouponCode = coupon.code;

          // ================= PERCENTAGE =================

          if (
            coupon.discountType === "PERCENTAGE"
          ) {
            let discount =
              (eligibleForCouponTotal *
                Number(
                  coupon.discountValue || 0
                )) /
              100;

            const maxDiscount = Number(
              coupon.maxDiscount || 0
            );

            if (
              maxDiscount > 0 &&
              discount > maxDiscount
            ) {
              discount = maxDiscount;
            }

            couponDiscount = discount;
          }

          // ================= FLAT =================

          else if (
            coupon.discountType === "FLAT"
          ) {
            couponDiscount = Math.min(
              Number(
                coupon.discountValue || 0
              ),
              eligibleForCouponTotal
            );
          }
        }
      }
    }

    // =====================================================
    // FINAL ITEM CALCULATIONS
    // =====================================================

    let taxAmount = 0;

    const finalProcessedItems = [];

    for (const item of processedItems) {
      let itemCouponDiscount = 0;

      // ✅ APPLY COUPON ONLY ON NON OFFER ITEMS
      if (
        appliedCouponCode &&
        !item.offerApplied &&
        eligibleForCouponTotal > 0
      ) {
        const proportion =
          item.finalAmount /
          eligibleForCouponTotal;

        itemCouponDiscount =
          couponDiscount * proportion;
      }

      // ================= SUBTOTAL =================

      const subtotal =
        item.finalAmount - itemCouponDiscount;

      // ================= TOTAL DISCOUNT =================

      const totalDiscount =
        item.offerDiscountAmount +
        itemCouponDiscount;

      // ================= GST =================

      const gstAmount = Math.round(
        (subtotal * item.gstRate) / 100
      );

      taxAmount += gstAmount;

      // ================= FINAL PRICE =================

      const finalPrice =
        subtotal + gstAmount;

      finalProcessedItems.push({
        ...item,

        couponDiscountAmount:
          itemCouponDiscount,

        subtotal,

        totalDiscount,

        gstAmount,

        finalPrice,
      });
    }

    // =====================================================
    // FINAL TOTALS
    // =====================================================

    const finalSubTotal =
      subTotal - couponDiscount;

    const shippingFee =
      STATIC_SHIPPING_FEE;

    const grandTotal =
      finalSubTotal +
      taxAmount +
      shippingFee;

    // =====================================================
    // ORDER
    // =====================================================

    const orderNumber =
      generateOrderNumber();

    const otp = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    const order = await Order.create(
      {
        orderNumber,

        userId,

        otp,

        otpVerified: false,

        // DISCOUNTS
        totalOriginalAmount,

        productOfferDiscount,

        couponDiscount,

        totalDiscount:
          productOfferDiscount +
          couponDiscount,

        couponCode: appliedCouponCode,

        // AMOUNTS
        subtotal: finalSubTotal,

        shippingFee,

        taxAmount,

        totalAmount: grandTotal,

        // STATUS
        status:
          paymentMethod === "COD"
            ? "confirmed"
            : "pending",

        paymentMethod,

        paymentStatus: "unpaid",

        confirmedAt:
          paymentMethod === "COD"
            ? new Date()
            : null,
      },
      { transaction: t }
    );

    // =====================================================
    // ORDER ITEMS
    // =====================================================

    const orderItems =
      finalProcessedItems.map((item) => ({
        orderId: order.id,

        productId: item.productId,

        variantId: item.variantId,

        sizeId: item.sizeId,

        // PRODUCT
        productName: item.productName,

        variantInfo: item.variantInfo,

        // PRICE
        mrp: item.mrp,

        sellingPrice: item.sellingPrice,

        discountPercentage:
          item.discountPercentage,

        quantity: item.quantity,

        totalMrp: item.totalMrp,

        totalSellingPrice:
          item.totalSellingPrice,

        // OFFER
        offerId: item.offerId,

        subOfferId: item.subOfferId,

        offerDiscountType:
          item.offerDiscountType,

        offerDiscountValue:
          item.offerDiscountValue,

        offerDiscountAmount:
          item.offerDiscountAmount,

        offerApplied: item.offerApplied,

        finalAmount: item.finalAmount,

        // COUPON
        couponDiscountAmount:
          item.couponDiscountAmount,

        // TOTALS
        subtotal: item.subtotal,

        totalDiscount:
          item.totalDiscount,

        // GST
        gstRate: item.gstRate,

        gstAmount: item.gstAmount,

        finalPrice: item.finalPrice,
      }));

    await OrderItem.bulkCreate(
      orderItems,
      {
        transaction: t,
      }
    );

    // =====================================================
    // ORDER ADDRESS
    // =====================================================

    await OrderAddress.create(
      {
        orderId: order.id,

        fullName: userAddress.fullName,

        email: userAddress.email,

        phoneNumber:
          userAddress.phoneNumber,

        addressLine:
          userAddress.addressLine,

        country: userAddress.country,

        city: userAddress.city,

        state: userAddress.state,

        zipCode: userAddress.zipCode,

        landmark: userAddress.landmark,

        addressType:
          userAddress.addressType,
      },
      { transaction: t }
    );

    // =====================================================
    // SOLD COUNT
    // =====================================================

    for (const item of processedItems) {
      await Product.increment(
        {
          soldCount: item.quantity,
        },
        {
          where: {
            id: item.productId,
          },

          transaction: t,
        }
      );
    }

    // =====================================================
    // COD
    // =====================================================

    if (paymentMethod === "COD") {
      // STOCK DEDUCT
      for (const item of processedItems) {
        await VariantSize.decrement(
          "stock",
          {
            by: item.quantity,

            where: {
              id: item.sizeId,
            },

            transaction: t,
          }
        );

        await ProductVariant.decrement(
          "totalStock",
          {
            by: item.quantity,

            where: {
              id: item.variantId,
            },

            transaction: t,
          }
        );
      }

      // CLEAR CART
      await CartItem.destroy({
        where: { userId },
        transaction: t,
      });

      await CartCoupon.destroy({
        where: { userId },
        transaction: t,
      });

      await t.commit();

      // INVOICE
      const invoicePath =
        await generateInvoice(
          order,
          finalProcessedItems,
          userAddress
        );

      const recipientEmails = [
        user.email,
      ];

      if (
        userAddress.email &&
        userAddress.email !== user.email
      ) {
        recipientEmails.push(
          userAddress.email
        );
      }

      await sendInvoiceEmail(
        recipientEmails,
        order,
        finalProcessedItems,
        userAddress,
        invoicePath
      );

      return res.status(200).json({
        success: true,

        message:
          "Order placed successfully",

        data: {
          orderId: order.id,

          orderNumber:
            order.orderNumber,

          totalAmount: grandTotal,

          paymentMethod: "COD",

          paymentStatus: "unpaid",

          status: "confirmed",
        },
      });
    }

    // =====================================================
    // ICICI
    // =====================================================

    else if (paymentMethod === "ICICI") {
      await t.commit();

      const paymentData = {
        merchantId:
          process.env.ICICI_MERCHANT_ID,

        orderNumber:
          order.orderNumber,

        amount:
          grandTotal.toFixed(2),

        currency: "INR",

        returnUrl:
          process.env.ICICI_RETURN_URL,

        cancelUrl:
          process.env.ICICI_CANCEL_URL,

        customerName:
          userAddress.fullName,

        customerEmail:
          userAddress.email,

        customerMobile:
          userAddress.phoneNumber,
      };

      const payload =
        JSON.stringify(paymentData);

      const encData = encrypt(
        payload,
        process.env.ICICI_ENCRYPTION_KEY
      );

      const checksum =
        generateChecksum(
          encData,
          process.env.ICICI_CHECKSUM_KEY
        );

      return res.status(200).json({
        success: true,

        message:
          "Order created, proceeding to payment",

        data: {
          orderId: order.id,

          orderNumber:
            order.orderNumber,

          totalAmount: grandTotal,

          paymentMethod: "ICICI",

          paymentStatus: "unpaid",

          status: "pending",

          paymentDetails: {
            paymentUrl:
              process.env.ICICI_PAYMENT_URL,

            encData,

            checksum,

            merchantId:
              process.env.ICICI_MERCHANT_ID,
          },
        },
      });
    }

    // =====================================================
    // OTHER PAYMENTS
    // =====================================================

    else {
      await t.commit();

      const invoicePath =
        await generateInvoice(
          order,
          finalProcessedItems,
          userAddress
        );

      const recipientEmails = [
        user.email,
      ];

      if (
        userAddress.email &&
        userAddress.email !== user.email
      ) {
        recipientEmails.push(
          userAddress.email
        );
      }

      await sendInvoiceEmail(
        recipientEmails,
        order,
        finalProcessedItems,
        userAddress,
        invoicePath
      );

      return res.status(200).json({
        success: true,

        message:
          "Order created successfully",

        data: {
          orderId: order.id,

          orderNumber:
            order.orderNumber,

          totalAmount: grandTotal,

          paymentMethod,

          paymentStatus: "unpaid",

          status: "pending",
        },
      });
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    console.error(
      "Place Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Something went wrong while placing order",
    });
  }
};

/**
 * STEP 2 — ICICI REAL CALLBACK (PRODUCTION SAFE)
 */
// exports.iciciReturn = async (req, res) => {
//   let t;

//   try {
//     t = await sequelize.transaction();

//     const { encData, checksum } = req.body;

//     // 1️⃣ Basic validation
//     if (!encData || !checksum) {
//       throw new Error("Missing encData or checksum");
//     }

//     // 2️⃣ Verify checksum (security)
//     const generatedChecksum = generateChecksum(
//       encData,
//       process.env.ICICI_CHECKSUM_KEY
//     );

//     if (generatedChecksum !== checksum) {
//       throw new Error("Checksum mismatch");
//     }

//     // 3️⃣ Decrypt ICICI response
//     let decrypted;
//     try {
//       decrypted = JSON.parse(
//         decrypt(encData, process.env.ICICI_ENCRYPTION_KEY)
//       );
//     } catch (err) {
//       throw new Error("Invalid encrypted payload");
//     }

//     const { orderNumber, transactionId, status } = decrypted;

//     if (!orderNumber) {
//       throw new Error("Invalid ICICI response: missing orderNumber");
//     }

//     // 4️⃣ Lock pending order (prevents double payment processing)
//     const order = await Order.findOne({
//       where: { orderNumber },
//       include: [OrderItem],
//       transaction: t,
//       lock: t.LOCK.UPDATE,
//     });

//     if (!order) {
//       throw new Error("Order not found");
//     }

//     // 🔐 Idempotency check → already processed
//     if (order.status !== "pending") {
//       await t.commit();

//       return res.redirect(
//         `${process.env.FRONTEND_URL}/payment-result?status=${order.paymentStatus}&order=${order.orderNumber}`
//       );
//     }

//     // --------------------------------------------------
//     // 5️⃣ HANDLE SUCCESS PAYMENT
//     // --------------------------------------------------
//     if (status === "SUCCESS") {
//       // Update order payment info
//       await order.update(
//         {
//           status: "confirmed",
//           paymentStatus: "paid",
//           transactionId: transactionId || null,
//         },
//         { transaction: t }
//       );

//       // Deduct stock safely
//       for (const item of order.OrderItems) {
//         // Size stock
//         const sizeUpdated = await VariantSize.decrement("stock", {
//           by: item.quantity,
//           where: {
//             id: item.sizeId,
//             stock: { [sequelize.Op.gte]: item.quantity }, // prevent negative stock
//           },
//           transaction: t,
//         });

//         if (!sizeUpdated[0][1]) {
//           throw new Error("Stock mismatch during payment confirmation");
//         }

//         // Variant total stock
//         await ProductVariant.decrement("totalStock", {
//           by: item.quantity,
//           where: { id: item.variantId },
//           transaction: t,
//         });
//       }

//       // Clear user cart
//       await CartItem.destroy({
//         where: { userId: order.userId },
//         transaction: t,
//       });
//     }

//     // --------------------------------------------------
//     // 6️⃣ HANDLE FAILED / CANCELLED PAYMENT
//     // --------------------------------------------------
//     else {
//       await order.update(
//         {
//           status: "cancelled",
//           paymentStatus: "failed",
//           transactionId: transactionId || null,
//         },
//         { transaction: t }
//       );
//     }

//     await t.commit();

//     // --------------------------------------------------
//     // 7️⃣ Redirect user to frontend result page
//     // --------------------------------------------------
//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment-result?status=${order.paymentStatus}&order=${order.orderNumber}`
//     );
//   } catch (err) {
//     if (t) await t.rollback();

//     console.error("ICICI CALLBACK ERROR:", err.message);

//     // Never expose internal error to ICICI
//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment-result?status=error`
//     );
//   }
// };

exports.iciciReturn = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { encData, checksum } = req.body;

    //  Validate checksum
    const validChecksum = generateChecksum(
      encData,
      process.env.ICICI_CHECKSUM_KEY,
    );

    if (validChecksum !== checksum) {
      throw new Error("Checksum mismatch");
    }

    //  Decrypt ICICI response
    const decrypted = JSON.parse(
      decrypt(encData, process.env.ICICI_ENCRYPTION_KEY),
    );

    const { orderNumber, transactionId, status } = decrypted;

    if (!orderNumber) throw new Error("Invalid ICICI payload");

    // Find order safely
    const order = await Order.findOne({
      where: { orderNumber },
      include: [OrderItem],
      transaction: t,
      lock: true,
    });

    if (!order) throw new Error("Order not found");

    // Prevent duplicate payment processing
    if (order.paymentStatus === "paid") {
      await t.commit();
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    }

    // SUCCESS FLOW
    if (status === "SUCCESS") {
      await order.update(
        {
          status: "confirmed",
          paymentStatus: "paid",
          transactionId,
          paidAt: new Date(),
        },
        { transaction: t },
      );

      //  Deduct stock
      for (const item of order.OrderItems) {
        await VariantSize.decrement("stock", {
          by: item.quantity,
          where: { id: item.sizeId },
          transaction: t,
        });

        await ProductVariant.decrement("totalStock", {
          by: item.quantity,
          where: { id: item.variantId },
          transaction: t,
        });
      }

      //  Clear cart
      await CartItem.destroy({
        where: { userId: order.userId },
        transaction: t,
      });

      //  Generate invoice number (simple example)
      const invoiceNumber = `INV-${Date.now()}`;

      await order.update({ invoiceNumber }, { transaction: t });

      await t.commit();

      //  Redirect to frontend success page
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?order=${order.orderNumber}`,
      );
    }

    //  FAILED PAYMENT FLOW
    await order.update(
      { status: "cancelled", paymentStatus: "failed" },
      { transaction: t },
    );

    await t.commit();

    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  } catch (err) {
    await t.rollback();

    console.error("ICICI RETURN ERROR:", err.message);

    return res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
  }
};

// STEP 3 — Local Test Callback (for Postman testing)

exports.iciciTestCallback = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { orderNumber, transactionId = "TEST_TXN_123", status } = req.body;

    if (!orderNumber) {
      throw new Error("orderNumber is required in request body");
    }

    const order = await Order.findOne({
      where: { orderNumber, status: "pending" },
      include: [OrderItem],
      transaction: t,
      lock: true,
    });

    if (!order) throw new Error("Order not found or already processed");

    if (status === "SUCCESS") {
      await order.update(
        { status: "confirmed", paymentStatus: "paid", transactionId },
        { transaction: t },
      );

      for (const item of order.OrderItems) {
        await VariantSize.decrement("stock", {
          by: item.quantity,
          where: { id: item.sizeId },
          transaction: t,
        });

        await ProductVariant.decrement("totalStock", {
          by: item.quantity,
          where: { id: item.variantId },
          transaction: t,
        });
      }

      await CartItem.destroy({
        where: { userId: order.userId },
        transaction: t,
      });
    } else {
      await order.update(
        { status: "cancelled", paymentStatus: "failed" },
        { transaction: t },
      );
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Test payment processed successfully",
    });
  } catch (err) {
    await t.rollback();

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
