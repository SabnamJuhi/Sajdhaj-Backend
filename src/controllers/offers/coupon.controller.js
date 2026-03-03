const {
  CartItem,
  Product,
  ProductPrice,
  ProductVariant,
  VariantSize,
  Offer,
  OfferSub,
  OfferApplicableProduct
} = require("../../models");
const { Op } = require("sequelize");
const { calculateCartDiscount } = require("../../services/discount.service");
const Coupon = require("../../models/offers/coupon.model");
const CartCoupon = require("../../models/offers/cartCoupon.model");

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCoupons = async (req, res) => {
  const coupons = await Coupon.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.json({ success: true, data: coupons });
};

exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Not found" });

  await coupon.update(req.body);
  res.json({ success: true });
};

exports.deactivateCoupon = async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Not found" });

  await coupon.update({ isActive: false });
  res.json({ success: true });
};


// exports.applyCoupon = async (req, res) => {
//   try {
//     const { couponCode } = req.body;
//     const userId = req.user.id;
//     const now = new Date();

//     if (!couponCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon code is required"
//       });
//     }

//     // 1️⃣ Fetch Cart Items
//     const cartItems = await CartItem.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Product,
//           as: "product",
//           include: [{ model: ProductPrice, as: "price" }]
//         },
//         { model: ProductVariant, as: "variant" },
//         { model: VariantSize, as: "variantSize" }
//       ]
//     });

//     if (!cartItems.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart is empty"
//       });
//     }

//     // 2️⃣ Get discount calculation with offer details
//     const result = await calculateCartDiscount(cartItems, null); // Pass null to get offer info only

//     if (!result) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart calculation failed"
//       });
//     }

//     // 3️⃣ Calculate eligible amount (items WITHOUT offers)
//     const eligibleForCouponTotal = result.items
//       .filter(item => !item.offerApplied)
//       .reduce((sum, item) => sum + item.originalAmount, 0);

//     const subTotal = Number(result.finalPayableAmount) || 0;

//     // 4️⃣ Validate Coupon
//     const coupon = await Coupon.findOne({
//       where: {
//         code: couponCode,
//         isActive: true,
//         startDate: { [Op.lte]: now },
//         endDate: { [Op.gte]: now }
//       }
//     });

//     if (!coupon) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired coupon"
//       });
//     }

//     const minCartValue = Number(coupon.minCartValue) || 0;

//     // 🔥 Check if eligible products (without offers) meet minimum cart value
//     if (eligibleForCouponTotal < minCartValue) {
//       return res.status(400).json({
//         success: false,
//         message: `Coupon applicable only on non-offer items. Need ₹${minCartValue} worth of items without offers, currently ₹${eligibleForCouponTotal}`,
//         details: {
//           requiredAmount: minCartValue,
//           currentEligibleAmount: eligibleForCouponTotal,
//           shortBy: minCartValue - eligibleForCouponTotal,
//           itemsWithOffers: result.items.filter(item => item.offerApplied).length,
//           itemsWithoutOffers: result.items.filter(item => !item.offerApplied).length
//         }
//       });
//     }

//     // 5️⃣ Calculate Coupon Discount (based on eligible items)
//     let couponDiscount = 0;
//     const discountValue = Number(coupon.discountValue) || 0;
//     const maxDiscount = Number(coupon.maxDiscount) || 0;

//     if (coupon.discountType === "PERCENTAGE") {
//       couponDiscount = (eligibleForCouponTotal * discountValue) / 100;
//       if (maxDiscount) {
//         couponDiscount = Math.min(couponDiscount, maxDiscount);
//       }
//     } else if (coupon.discountType === "FLAT") {
//       couponDiscount = discountValue;
//     }

//     const finalSubTotal = subTotal - couponDiscount;

//     // 6️⃣ Save Coupon
//     await CartCoupon.upsert({
//       userId,
//       couponId: coupon.id,
//       couponCode: coupon.code
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Coupon applied successfully",
//       data: {
//         couponCode: coupon.code,
//         eligibleForCouponTotal,
//         productOfferDiscount: result.productOfferDiscount,
//         subTotal,
//         couponDiscount,
//         finalSubTotal,
//         summary: {
//           itemsWithOffers: result.items.filter(i => i.offerApplied).length,
//           itemsWithoutOffers: result.items.filter(i => !i.offerApplied).length
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Apply Coupon Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message
//     });
//   }
// };


exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user.id;
    const now = new Date();

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required"
      });
    }

    // 1️⃣ Fetch Cart Items
    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: ProductPrice, as: "price" }]
        },
        { model: ProductVariant, as: "variant" },
        { model: VariantSize, as: "variantSize" }
      ]
    });

    if (!cartItems.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // 2️⃣ Fetch Active Offers
    const activeOffers = await Offer.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now }
      },
      include: [
        { model: OfferSub, as: "subOffers" },
        { model: OfferApplicableProduct, as: "offerApplicableProducts" }
      ]
    });

    // 3️⃣ Process Cart Items to identify items with/without offers
    let totalOriginalAmount = 0;
    let productOfferDiscount = 0;
    let subTotalAfterOffers = 0;
    let eligibleForCouponTotal = 0; // Sum of items WITHOUT offers (original price)
    let eligibleItems = []; // Track eligible items for detailed response

    const processedItems = [];

    for (let item of cartItems) {
      const sellingPrice = Number(item.product?.price?.sellingPrice || 0);
      const quantity = item.quantity;
      const originalAmount = sellingPrice * quantity;
      
      totalOriginalAmount += originalAmount;

      let itemDiscount = 0;
      let offerApplied = false;
      let appliedOfferDetails = null;

      // Check if this product has any active offer
      for (let offer of activeOffers) {
        const isProductEligible = offer.offerApplicableProducts.some(
          p => p.productId === item.productId
        );

        if (!isProductEligible) continue;

        const subOffer = offer.subOffers[0];
        if (!subOffer) continue;

        if (originalAmount < subOffer.minOrderValue) continue;

        if (subOffer.discountType === "PERCENTAGE") {
          let discount = (originalAmount * subOffer.discountValue) / 100;
          if (subOffer.maxDiscount) {
            discount = Math.min(discount, subOffer.maxDiscount);
          }
          itemDiscount = discount;
        } else if (subOffer.discountType === "FLAT") {
          itemDiscount = subOffer.discountValue;
        }

        offerApplied = true;
        appliedOfferDetails = {
          offerId: offer.id,
          discountType: subOffer.discountType,
          discountValue: subOffer.discountValue,
          discountAmount: itemDiscount
        };
        break;
      }

      const finalAmount = originalAmount - itemDiscount;
      
      subTotalAfterOffers += finalAmount;
      productOfferDiscount += itemDiscount;
      
      // If no offer applied, add to eligibleForCouponTotal
      if (!offerApplied) {
        eligibleForCouponTotal += originalAmount;
        eligibleItems.push({
          productId: item.productId,
          productName: item.product?.title,
          quantity,
          price: sellingPrice,
          originalAmount,
          finalAmount
        });
      }

      processedItems.push({
        productId: item.productId,
        productName: item.product?.title,
        originalAmount,
        itemDiscount,
        finalAmount,
        offerApplied,
        appliedOfferDetails
      });
    }

    // 4️⃣ Validate Coupon
    const coupon = await Coupon.findOne({
      where: {
        code: couponCode,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now }
      }
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired coupon"
      });
    }

    const minCartValue = Number(coupon.minCartValue) || 0;

    // Check if eligible products (without offers) meet minimum cart value
    if (eligibleForCouponTotal < minCartValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires ₹${minCartValue} worth of items without any product offers. Current non-offer items total: ₹${eligibleForCouponTotal}`,
        details: {
          requiredAmount: minCartValue,
          currentEligibleAmount: eligibleForCouponTotal,
          shortBy: minCartValue - eligibleForCouponTotal,
          eligibleItems: eligibleItems,
          itemsWithOffers: processedItems.filter(item => item.offerApplied).length,
          itemsWithoutOffers: processedItems.filter(item => !item.offerApplied).length,
          suggestion: "Add more items that don't have active product offers to use this coupon"
        }
      });
    }

    // 5️⃣ Calculate Coupon Discount
    let couponDiscount = 0;
    const discountValue = Number(coupon.discountValue) || 0;
    const maxDiscount = Number(coupon.maxDiscount) || 0;

    // Calculate based on eligible items only
    let discountCalculationDetails = {};

    if (coupon.discountType === "PERCENTAGE") {
      const calculatedDiscount = (eligibleForCouponTotal * discountValue) / 100;
      
      discountCalculationDetails = {
        calculationBasis: "eligibleItemsTotal",
        eligibleAmount: eligibleForCouponTotal,
        discountPercentage: discountValue,
        calculatedDiscount: calculatedDiscount,
        maxDiscountCap: maxDiscount
      };

      if (maxDiscount > 0 && calculatedDiscount > maxDiscount) {
        couponDiscount = maxDiscount;
        discountCalculationDetails.appliedDiscount = maxDiscount;
        discountCalculationDetails.reason = `Capped at max discount of ₹${maxDiscount}`;
      } else {
        couponDiscount = calculatedDiscount;
        discountCalculationDetails.appliedDiscount = calculatedDiscount;
        discountCalculationDetails.reason = "Within max discount limit";
      }
    } 
    else if (coupon.discountType === "FLAT") {
      couponDiscount = Math.min(discountValue, eligibleForCouponTotal);
      
      discountCalculationDetails = {
        calculationBasis: "flatDiscount",
        flatDiscountValue: discountValue,
        eligibleAmount: eligibleForCouponTotal,
        appliedDiscount: couponDiscount,
        reason: couponDiscount < discountValue ? 
          `Adjusted to ₹${couponDiscount} as it cannot exceed eligible items total` : 
          "Full flat discount applied"
      };
    }

    const finalSubTotal = subTotalAfterOffers - couponDiscount;

    // 6️⃣ Save Coupon
    await CartCoupon.upsert({
      userId,
      couponId: coupon.id,
      couponCode: coupon.code
    });

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        couponCode: coupon.code,
        couponDetails: {
          type: coupon.discountType,
          value: discountValue,
          maxDiscount: maxDiscount || "No limit",
          minCartValue: minCartValue
        },
        // Cart breakdown
        cartSummary: {
          totalOriginalAmount,
          productOfferDiscount,
          subTotalAfterOffers,
          eligibleForCouponTotal,
          couponDiscount,
          finalSubTotal
        },
        // Detailed calculation
        discountCalculation: discountCalculationDetails,
        // Item summary
        itemsSummary: {
          total: processedItems.length,
          withOffers: processedItems.filter(item => item.offerApplied).length,
          withoutOffers: processedItems.filter(item => !item.offerApplied).length,
          eligibleItems: eligibleItems
        },
        // Message explaining the discount
        message: coupon.discountType === "PERCENTAGE" 
          ? `${discountValue}% discount applied on ₹${eligibleForCouponTotal} worth of eligible items = ₹${couponDiscount} discount` +
            (maxDiscount > 0 && couponDiscount === maxDiscount ? ` (capped at max ₹${maxDiscount})` : "")
          : `Flat ₹${discountValue} discount applied` +
            (couponDiscount < discountValue ? ` (adjusted to ₹${couponDiscount} as per eligible items total)` : "")
      }
    });

  } catch (error) {
    console.error("Apply Coupon Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

exports.getActiveCouponsForUser = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() }
      },
      order: [["createdAt", "DESC"]]
    });

    res.json({
      success: true,
      data: coupons
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};