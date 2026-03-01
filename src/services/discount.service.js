const {
  Offer,
  OfferSub,
  OfferApplicableProduct,
  Coupon
} = require("../models");

const { Op } = require("sequelize");

exports.calculateCartDiscount = async (cartItems, couponCode = null) => {

  let subtotal = 0;
  let productOfferDiscount = 0;
  let couponDiscount = 0;

  let eligibleForCouponTotal = 0;

  const processedItems = [];

  for (const item of cartItems) {

    const price = Number(item.product.price.sellingPrice);
    const qty = Number(item.quantity);
    const itemSubtotal = price * qty;

    // 1️⃣ Check Product Offer
    const applicableOffer = await OfferApplicableProduct.findOne({
      where: { productId: item.productId },
      include: [{
        model: OfferSub,
        where: {
          validFrom: { [Op.lte]: new Date() },
          validTill: { [Op.gte]: new Date() }
        }
      }]
    });

    let finalItemAmount = itemSubtotal;
    let itemDiscount = 0;

    if (applicableOffer && applicableOffer.OfferSub) {

      const sub = applicableOffer.OfferSub;

      if (sub.discountType === "PERCENTAGE") {
        itemDiscount = (itemSubtotal * sub.discountValue) / 100;
      } else {
        itemDiscount = sub.discountValue;
      }

      if (sub.maxDiscount) {
        itemDiscount = Math.min(itemDiscount, sub.maxDiscount);
      }

      finalItemAmount -= itemDiscount;
      productOfferDiscount += itemDiscount;

    } else {
      // Eligible for coupon
      eligibleForCouponTotal += itemSubtotal;
    }

    subtotal += finalItemAmount;

    processedItems.push({
      ...item.toJSON(),
      itemSubtotal,
      itemDiscount,
      finalItemAmount
    });
  }

  // 2️⃣ Apply Coupon Only On Non-Offer Items
  if (couponCode && eligibleForCouponTotal > 0) {

    const coupon = await Coupon.findOne({
      where: {
        code: couponCode,
        isActive: true,
        validFrom: { [Op.lte]: new Date() },
        validTill: { [Op.gte]: new Date() }
      }
    });

    if (coupon && eligibleForCouponTotal >= coupon.minCartValue) {

      if (coupon.discountType === "PERCENTAGE") {
        couponDiscount =
          (eligibleForCouponTotal * coupon.discountValue) / 100;
      } else {
        couponDiscount = coupon.discountValue;
      }

      if (coupon.maxDiscount) {
        couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      }

      subtotal -= couponDiscount;
    }
  }

  return {
    subtotal,
    productOfferDiscount,
    couponDiscount,
    processedItems
  };
};