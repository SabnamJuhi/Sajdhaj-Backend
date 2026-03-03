const {
  OfferApplicableProduct,
  OfferSub,
} = require("../models");
const { Op } = require("sequelize");
const Coupon = require("../models/offers/coupon.model");

exports.calculateCartDiscount = async (cartItems, couponCode = null) => {

  let totalOriginalAmount = 0;
  let productOfferDiscount = 0;
  let couponDiscount = 0;
  let eligibleForCouponTotal = 0;

  const processedItems = [];

  for (const item of cartItems) {

    const price = Number(item.product.price.sellingPrice);
    const qty = Number(item.quantity);
    const originalAmount = price * qty;

    totalOriginalAmount += originalAmount;

    let itemDiscount = 0;
    let finalAmount = originalAmount;

    // 🔹 1️⃣ PRODUCT OFFER CHECK
    const offer = await OfferApplicableProduct.findOne({
      where: { productId: item.productId },
      include: [{
        model: OfferSub,
        where: {
          validFrom: { [Op.lte]: new Date() },
          validTill: { [Op.gte]: new Date() }
        }
      }]
    });

    if (offer && offer.OfferSub) {

      const sub = offer.OfferSub;

      if (sub.discountType === "PERCENTAGE") {
        itemDiscount = (originalAmount * sub.discountValue) / 100;
      } else {
        itemDiscount = sub.discountValue;
      }

      if (sub.maxDiscount) {
        itemDiscount = Math.min(itemDiscount, sub.maxDiscount);
      }

      finalAmount -= itemDiscount;
      productOfferDiscount += itemDiscount;

    } else {
      eligibleForCouponTotal += originalAmount;
    }

    processedItems.push({
      ...item.toJSON(),
      originalAmount,
      itemDiscount,
      finalAmount,
      offerApplied: itemDiscount > 0
    });
  }

  let subtotalAfterProductOffer =
    totalOriginalAmount - productOfferDiscount;

  // 🔹 2️⃣ COUPON APPLY ONLY ON NON-OFFER ITEMS
  if (couponCode && eligibleForCouponTotal > 0) {

    const coupon = await Coupon.findOne({
      where: {
        code: couponCode,
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() }
      }
    });

    if (!coupon) {
      throw new Error("Invalid coupon");
    }

    if (eligibleForCouponTotal >= coupon.minCartValue) {

      if (coupon.discountType === "PERCENTAGE") {
        couponDiscount =
          (eligibleForCouponTotal * coupon.discountValue) / 100;
      } else {
        couponDiscount = coupon.discountValue;
      }

      if (coupon.maxDiscount) {
        couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      }

      subtotalAfterProductOffer -= couponDiscount;
    }
  }

  return {
    items: processedItems,
    totalOriginalAmount,
    productOfferDiscount,
    couponDiscount,
    finalPayableAmount: subtotalAfterProductOffer
  };
};