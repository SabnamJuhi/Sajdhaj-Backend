const { Op } = require("sequelize");
const {
  CartItem,
  Product,
  ProductPrice,
  ProductVariant,
  VariantSize,
  VariantImage,
  Offer,
  OfferSub,
  OfferApplicableProduct,
  Coupon,
} = require("../../models");
const { calculateCartDiscount } = require("../../services/discount.service");
const CartCoupon = require("../../models/offers/cartCoupon.model");
const ShippingSetting = require("../../models/shippingFee/shipping.model");


// exports.getCart = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const now = new Date();

//     // 0️⃣ Shipping Settings
//     let shippingSettings = await ShippingSetting.findOne();
//     if (!shippingSettings) {
//       shippingSettings = await ShippingSetting.create({
//         shippingFee: 50,
//       });
//     }

//     const STATIC_SHIPPING_FEE = Number(shippingSettings.shippingFee);

//     // 1️⃣ Saved Coupon
//     const savedCoupon = await CartCoupon.findOne({ where: { userId } });
//     const couponCode = savedCoupon?.couponCode || null;

//     // 2️⃣ Cart Items
//     const cartItems = await CartItem.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Product,
//           as: "product",
//           include: [{ model: ProductPrice, as: "price" }],
//         },
//         {
//           model: ProductVariant,
//           as: "variant",
//           include: [
//             {
//               model: VariantImage,
//               as: "images",
//               attributes: ["id", "imageUrl"],
//               limit: 5,
//             },
//           ],
//         },
//         { model: VariantSize, as: "variantSize" },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     let itemsCount = cartItems.length;
//     let totalQuantity = 0;

//     let subTotal = 0;
//     let totalOriginalAmount = 0;
//     let productOfferDiscount = 0;

//     let eligibleForCouponTotal = 0;
//     let eligibleItemsCount = 0;
//     let itemsWithOffersCount = 0;

//     // 3️⃣ Active Offers
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
//     });

//     const processedItems = [];

//     // 4️⃣ Process Cart Items
//     for (let item of cartItems) {
//       const sellingPrice = Number(item.product?.price?.sellingPrice || 0);
//       const gstRate = Number(item.product?.gstRate || 0);

//       const quantity = item.quantity;
//       const currentStock = item.variantSize?.stock || 0;

//       const isAvailable = currentStock > 0;
//       const validQuantity = isAvailable ? Math.min(quantity, currentStock) : 0;

//       totalQuantity += validQuantity;

//       const originalAmount = sellingPrice * validQuantity;
//       totalOriginalAmount += originalAmount;

//       let itemDiscount = 0;
//       let offerApplied = false;
//       let offerDetails = null;

//       // 🔥 OFFER LOGIC (SAME AS PLACE ORDER)
//       for (let offer of activeOffers) {
//         const isProductEligible = offer.offerApplicableProducts.some(
//           (p) => p.productId === item.productId
//         );

//         if (!isProductEligible) continue;

//         const subOffer = offer.subOffers[0];
//         if (!subOffer) continue;

//         if (originalAmount < subOffer.minOrderValue) continue;

//         if (subOffer.discountType === "PERCENTAGE") {
//           let discount =
//             (originalAmount * subOffer.discountValue) / 100;

//           if (subOffer.maxDiscount) {
//             discount = Math.min(discount, subOffer.maxDiscount);
//           }

//           itemDiscount = discount;

//           offerDetails = {
//             type: "PERCENTAGE",
//             value: subOffer.discountValue,
//             maxDiscount: subOffer.maxDiscount,
//           };
//         } else if (subOffer.discountType === "FLAT") {
//           itemDiscount = subOffer.discountValue;

//           offerDetails = {
//             type: "FLAT",
//             value: subOffer.discountValue,
//           };
//         }

//         offerApplied = true;
//         break;
//       }

//       const finalAmount = originalAmount - itemDiscount;

//       if (isAvailable) {
//         subTotal += finalAmount;
//         productOfferDiscount += itemDiscount;

//         if (!offerApplied) {
//           eligibleForCouponTotal += originalAmount;
//           eligibleItemsCount++;
//         } else {
//           itemsWithOffersCount++;
//         }
//       }

//       // 🖼 Images
//       const images = item.variant?.images || [];
//       const primaryImage = images[0];

//       processedItems.push({
//         cartId: item.id,
//         productId: item.productId,
//         variantId: item.variantId,
//         sizeId: item.sizeId,

//         title: item.product?.title || "Unknown Product",

//         variant: {
//           color: item.variant?.colorName,
//           size: item.variantSize?.size,
//           stock: currentStock,
//           status: isAvailable ? "In Stock" : "Out of Stock",
//           isAvailable,
//         },

//         images: {
//           all: images.map((img) => ({
//             id: img.id,
//             url: img.imageUrl,
//           })),
//           primary: primaryImage?.imageUrl || null,
//           count: images.length,
//         },

//         image: primaryImage?.imageUrl || null,

//         price: sellingPrice,
//         quantity: validQuantity,
//         originalAmount,
//         itemDiscount,
//         finalAmount,
//         gstRate,
//         offerApplied,
//         offerDetails,
//       });
//     }

//     // ===============================
//     // COUPON
//     // ===============================

//     let couponDiscount = 0;
//     let appliedCoupon = null;
//     let couponDetails = null;

//     if (couponCode && eligibleForCouponTotal > 0) {
//       const coupon = await Coupon.findOne({
//         where: {
//           code: couponCode,
//           isActive: true,
//           startDate: { [Op.lte]: now },
//           endDate: { [Op.gte]: now },
//         },
//       });

//       if (coupon) {
//         const minCartValue = Number(coupon.minCartValue || 0);

//         if (eligibleForCouponTotal >= minCartValue) {
//           appliedCoupon = coupon.code;

//           if (coupon.discountType === "PERCENTAGE") {
//             let discount =
//               (eligibleForCouponTotal *
//                 Number(coupon.discountValue || 0)) /
//               100;

//             if (coupon.maxDiscount) {
//               discount = Math.min(discount, coupon.maxDiscount);
//             }

//             couponDiscount = discount;

//             couponDetails = {
//               type: "PERCENTAGE",
//               value: coupon.discountValue,
//               maxDiscount: coupon.maxDiscount,
//             };
//           } else if (coupon.discountType === "FLAT") {
//             const flatDiscount = Number(coupon.discountValue || 0);

//             couponDiscount = Math.min(
//               flatDiscount,
//               eligibleForCouponTotal
//             );

//             couponDetails = {
//               type: "FLAT",
//               value: flatDiscount,
//             };
//           }
//         }
//       }
//     }

//     const finalSubTotal = subTotal - couponDiscount;

//     // ===============================
//     // GST
//     // ===============================

//     let taxAmount = 0;
//     let itemizedTax = [];

//     for (let item of processedItems) {
//       if (!item.variant.isAvailable) continue;

//       let itemAfterCoupon = item.finalAmount;

//       if (appliedCoupon && !item.offerApplied) {
//         const proportion =
//           item.originalAmount / eligibleForCouponTotal;

//         itemAfterCoupon =
//           item.finalAmount - couponDiscount * proportion;
//       }

//       const tax = Math.round(
//         (itemAfterCoupon * item.gstRate) / 100
//       );

//       taxAmount += tax;

//       itemizedTax.push({
//         productId: item.productId,
//         title: item.title,
//         baseAmount: itemAfterCoupon,
//         gstRate: item.gstRate,
//         taxAmount: tax,
//       });
//     }

//     const shippingFee = STATIC_SHIPPING_FEE;
//     const grandTotal = finalSubTotal + taxAmount + shippingFee;

//     return res.status(200).json({
//       success: true,
//       data: { items: processedItems },
//       summary: {
//         itemsCount,
//         totalQuantity,
//         totalOriginalAmount,
//         productOfferDiscount,
//         subTotal,

//         couponDiscount,
//         finalSubTotal,

//         tax: {
//           amount: taxAmount,
//           breakdown: itemizedTax,
//         },

//         shippingFee,
//         grandTotal,
//         currency: "INR",

//         appliedCoupon,
//         couponDetails,

//         couponEligibility: {
//           eligibleAmount: eligibleForCouponTotal,
//           eligibleItemsCount,
//           itemsWithOffersCount,
//         },

//         canCheckout:
//           processedItems.length > 0 &&
//           processedItems.every(
//             (i) => i.variant.isAvailable && i.quantity > 0
//           ),
//       },
//     });
//   } catch (error) {
//     console.error("Get Cart Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // ===============================
    // SHIPPING SETTINGS
    // ===============================

    let shippingSettings = await ShippingSetting.findOne();

    if (!shippingSettings) {
      shippingSettings = await ShippingSetting.create({
        shippingFee: 50,
      });
    }

    const STATIC_SHIPPING_FEE = Number(
      shippingSettings.shippingFee || 0
    );

    // ===============================
    // SAVED COUPON
    // ===============================

    const savedCoupon = await CartCoupon.findOne({
      where: { userId },
    });

    const couponCode = savedCoupon?.couponCode || null;

    // ===============================
    // CART ITEMS
    // ===============================

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
          ],
        },

        {
          model: ProductVariant,
          as: "variant",

          include: [
            {
              model: VariantImage,
              as: "images",
              attributes: ["id", "imageUrl"],
              limit: 5,
            },
          ],
        },

        {
          model: VariantSize,
          as: "variantSize",
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    // ===============================
    // ACTIVE PRODUCT OFFERS
    // ===============================

    const productOffers =
      await OfferApplicableProduct.findAll({
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

            required: true,

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
      });

    // ===============================
    // SUMMARY VARIABLES
    // ===============================

    let itemsCount = cartItems.length;
    let totalQuantity = 0;

    let subTotal = 0;
    let totalOriginalAmount = 0;
    let productOfferDiscount = 0;

    let eligibleForCouponTotal = 0;
    let eligibleItemsCount = 0;
    let itemsWithOffersCount = 0;

    const processedItems = [];

    // ===============================
    // PROCESS CART ITEMS
    // ===============================

    for (let item of cartItems) {
      const sellingPrice = Number(
        item.product?.price?.sellingPrice || 0
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

      const originalAmount =
        sellingPrice * validQuantity;

      totalOriginalAmount += originalAmount;

      // ===============================
      // OFFER VARIABLES
      // ===============================

      let itemDiscount = 0;
      let offerApplied = false;
      let offerDetails = null;

      // ===============================
      // FIND APPLICABLE PRODUCT OFFER
      // ===============================

      const applicableOffer =
        productOffers.find(
          (o) => o.productId === item.productId
        );

      if (applicableOffer) {
        const activeOffer =
          applicableOffer.offerDetails;

        // Find exact mapped suboffer
        const subOffer =
          activeOffer?.subOffers?.find(
            (s) =>
              s.id === applicableOffer.subOfferId
          ) ||
          activeOffer?.subOffers?.[0];

        if (subOffer) {
          const minOrderValue = Number(
            subOffer.minOrderValue || 0
          );

          if (originalAmount >= minOrderValue) {
            // ===============================
            // PERCENTAGE DISCOUNT
            // ===============================

            if (
              subOffer.discountType ===
              "PERCENTAGE"
            ) {
              let discount =
                (originalAmount *
                  Number(
                    subOffer.discountValue || 0
                  )) /
                100;

              if (subOffer.maxDiscount) {
                discount = Math.min(
                  discount,
                  Number(subOffer.maxDiscount)
                );
              }

              itemDiscount = discount;

              offerDetails = {
                offerId: activeOffer.id,
                subOfferId: subOffer.id,

                offerCode:
                  activeOffer.offerCode,

                type: "PERCENTAGE",

                value:
                  subOffer.discountValue,

                maxDiscount:
                  subOffer.maxDiscount,

                minOrderValue:
                  subOffer.minOrderValue,
              };
            }

            // ===============================
            // FLAT DISCOUNT
            // ===============================

            else if (
              subOffer.discountType === "FLAT"
            ) {
              itemDiscount = Number(
                subOffer.discountValue || 0
              );

              offerDetails = {
                offerId: activeOffer.id,
                subOfferId: subOffer.id,

                offerCode:
                  activeOffer.offerCode,

                type: "FLAT",

                value:
                  subOffer.discountValue,

                minOrderValue:
                  subOffer.minOrderValue,
              };
            }

            offerApplied = true;
          }
        }
      }

      // ===============================
      // FINAL ITEM AMOUNT
      // ===============================

      const finalAmount =
        originalAmount - itemDiscount;

      // ===============================
      // SUMMARY CALCULATIONS
      // ===============================

      if (isAvailable) {
        subTotal += finalAmount;

        productOfferDiscount += itemDiscount;

        // Coupon only on products without offers
        if (!offerApplied) {
          eligibleForCouponTotal +=
            originalAmount;

          eligibleItemsCount++;
        } else {
          itemsWithOffersCount++;
        }
      }

      // ===============================
      // IMAGES
      // ===============================

      const images =
        item.variant?.images || [];

      const primaryImage = images[0];

      // ===============================
      // PUSH ITEM
      // ===============================

      processedItems.push({
        cartId: item.id,

        productId: item.productId,

        variantId: item.variantId,

        sizeId: item.sizeId,

        title:
          item.product?.title ||
          "Unknown Product",

        variant: {
          color: item.variant?.colorName,

          size: item.variantSize?.size,

          stock: currentStock,

          status: isAvailable
            ? "In Stock"
            : "Out of Stock",

          isAvailable,
        },

        images: {
          all: images.map((img) => ({
            id: img.id,
            url: img.imageUrl,
          })),

          primary:
            primaryImage?.imageUrl || null,

          count: images.length,
        },

        image:
          primaryImage?.imageUrl || null,

        price: sellingPrice,

        quantity: validQuantity,

        originalAmount,

        itemDiscount,

        finalAmount,

        gstRate,

        offerApplied,

        offerDetails,
      });
    }

    // ===============================
    // COUPON LOGIC
    // ===============================

    let couponDiscount = 0;

    let appliedCoupon = null;

    let couponDetails = null;

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
      });

      if (coupon) {
        const minCartValue = Number(
          coupon.minCartValue || 0
        );

        if (
          eligibleForCouponTotal >=
          minCartValue
        ) {
          appliedCoupon = coupon.code;

          // ===============================
          // PERCENTAGE COUPON
          // ===============================

          if (
            coupon.discountType ===
            "PERCENTAGE"
          ) {
            let discount =
              (eligibleForCouponTotal *
                Number(
                  coupon.discountValue || 0
                )) /
              100;

            if (coupon.maxDiscount) {
              discount = Math.min(
                discount,
                Number(coupon.maxDiscount)
              );
            }

            couponDiscount = discount;

            couponDetails = {
              type: "PERCENTAGE",

              value:
                coupon.discountValue,

              maxDiscount:
                coupon.maxDiscount,
            };
          }

          // ===============================
          // FLAT COUPON
          // ===============================

          else if (
            coupon.discountType === "FLAT"
          ) {
            const flatDiscount = Number(
              coupon.discountValue || 0
            );

            couponDiscount = Math.min(
              flatDiscount,
              eligibleForCouponTotal
            );

            couponDetails = {
              type: "FLAT",

              value: flatDiscount,
            };
          }
        }
      }
    }

    // ===============================
    // FINAL SUBTOTAL
    // ===============================

    const finalSubTotal =
      subTotal - couponDiscount;

    // ===============================
    // GST CALCULATION
    // ===============================

    let taxAmount = 0;

    let itemizedTax = [];

    for (let item of processedItems) {
      if (!item.variant.isAvailable)
        continue;

      let itemAfterCoupon =
        item.finalAmount;

      // Coupon distribution
      if (
        appliedCoupon &&
        !item.offerApplied
      ) {
        const proportion =
          item.originalAmount /
          eligibleForCouponTotal;

        itemAfterCoupon =
          item.finalAmount -
          couponDiscount * proportion;
      }

      const tax = Math.round(
        (itemAfterCoupon * item.gstRate) /
          100
      );

      taxAmount += tax;

      itemizedTax.push({
        productId: item.productId,

        title: item.title,

        baseAmount: itemAfterCoupon,

        gstRate: item.gstRate,

        taxAmount: tax,
      });
    }

    // ===============================
    // GRAND TOTAL
    // ===============================

    const shippingFee =
      STATIC_SHIPPING_FEE;

    const grandTotal =
      finalSubTotal +
      taxAmount +
      shippingFee;

    // ===============================
    // RESPONSE
    // ===============================

    return res.status(200).json({
      success: true,

      data: {
        items: processedItems,
      },

      summary: {
        itemsCount,

        totalQuantity,

        totalOriginalAmount,

        productOfferDiscount,

        subTotal,

        couponDiscount,

        finalSubTotal,

        tax: {
          amount: taxAmount,

          breakdown: itemizedTax,
        },

        shippingFee,

        grandTotal,

        currency: "INR",

        appliedCoupon,

        couponDetails,

        couponEligibility: {
          eligibleAmount:
            eligibleForCouponTotal,

          eligibleItemsCount,

          itemsWithOffersCount,
        },

        canCheckout:
          processedItems.length > 0 &&
          processedItems.every(
            (i) =>
              i.variant.isAvailable &&
              i.quantity > 0
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get Cart Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message: "Something went wrong",

      error: error.message,
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, sizeId, quantity = 1 } = req.body; // Default quantity to 1 if not provided
    const userId = req.user.id;

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    if (quantity > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum quantity allowed is 10",
      });
    }

    // Validate variant belongs to product
    const validVariant = await ProductVariant.findOne({
      where: { id: variantId, productId },
    });

    if (!validVariant) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant for this product",
      });
    }

    // Validate size belongs to variant
    const validSize = await VariantSize.findOne({
      where: { id: sizeId, variantId },
    });

    if (!validSize) {
      return res.status(400).json({
        success: false,
        message: "Invalid size for this variant",
      });
    }

    // Check stock availability
    if (validSize.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${validSize.stock} items available in stock`,
      });
    }

    // Find existing cart item
    const existingItem = await CartItem.findOne({
      where: { userId, productId, variantId, sizeId },
    });

    if (existingItem) {
      // Check if adding quantity would exceed stock
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > validSize.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${validSize.stock - existingItem.quantity} available`,
        });
      }

      // Update existing item quantity
      await existingItem.increment("quantity", { by: quantity });

      return res.json({
        success: true,
        message: `Added ${quantity} item(s) to cart`,
        data: {
          cartItemId: existingItem.id,
          newQuantity: existingItem.quantity + quantity,
          action: "updated",
        },
      });
    } else {
      // Create new cart item
      const newItem = await CartItem.create({
        userId,
        productId,
        variantId,
        sizeId,
        quantity,
      });

      return res.json({
        success: true,
        message: `Added ${quantity} item(s) to cart`,
        data: {
          cartItemId: newItem.id,
          quantity: newItem.quantity,
          action: "created",
        },
      });
    }
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Increment cart item quantity by 1 (using productId, variantId, sizeId in body)
 */
exports.incrementCartQuantity = async (req, res) => {
  try {
    const { productId, variantId, sizeId } = req.body;
    const userId = req.user.id;

    // Find the cart item
    const item = await CartItem.findOne({
      where: { userId, productId, variantId, sizeId },
      include: [
        {
          model: VariantSize,
          as: "variantSize",
          where: { id: sizeId },
          attributes: ["stock"],
        },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Check stock availability
    const newQuantity = item.quantity + 1;

    if (item.variantSize && item.variantSize.stock < newQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.variantSize.stock} items available in stock`,
      });
    }

    // Increment quantity
    await item.increment("quantity", { by: 1 });

    res.json({
      success: true,
      message: "Quantity increased",
      data: {
        cartItemId: item.id,
        newQuantity: item.quantity + 1,
        productId,
        variantId,
        sizeId,
      },
    });
  } catch (error) {
    console.error("Increment Cart Quantity Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.decreaseQuantity = async (req, res) => {
  try {
    const { productId, variantId, sizeId } = req.body;
    const userId = req.user.id;

    const item = await CartItem.findOne({
      where: { userId, productId, variantId, sizeId },
    });

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.quantity > 1) {
      await item.decrement("quantity", { by: 1 });
    } else {
      await item.destroy();
    }

    res.json({ success: true, message: "Quantity decreased" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.mergeGuestCart = async (req, res) => {
  const transaction = await CartItem.sequelize.transaction();

  try {
    const userId = req.user.id;
    const { items } = req.body;

    for (const g of items) {
      const { productId, variantId, sizeId, quantity } = g;

      const validVariant = await ProductVariant.findOne({
        where: { id: variantId, productId },
      });
      if (!validVariant) continue;

      const validSize = await VariantSize.findOne({
        where: { id: sizeId, variantId },
      });
      if (!validSize) continue;

      const existing = await CartItem.findOne({
        where: { userId, productId, variantId, sizeId },
        transaction,
      });

      if (existing) {
        await existing.increment("quantity", {
          by: quantity || 1,
          transaction,
        });
      } else {
        await CartItem.create(
          { userId, productId, variantId, sizeId, quantity: quantity || 1 },
          { transaction },
        );
      }
    }

    await transaction.commit();
    res.json({ success: true, message: "Guest cart merged" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. REMOVE ITEM COMPLETELY
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    await CartItem.destroy({ where: { id: cartId, userId: req.user.id } });
    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/cart/item
exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const { productId, variantId, sizeId } = req.body;

    if (!productId || !variantId || !sizeId) {
      return res.status(400).json({
        success: false,
        message: "productId, variantId and sizeId are required",
      });
    }

    // Find exact cart row
    const cartItem = await CartItem.findOne({
      where: {
        userId,
        productId,
        variantId,
        sizeId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Delete whole row (even if quantity = 29 or 14 etc.)
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    console.error("Delete cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting cart item",
    });
  }
};
