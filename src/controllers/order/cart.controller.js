const { Op } = require("sequelize");
const {
  CartItem,
  Product,
  ProductPrice,
  ProductVariant,
  VariantSize,
  Offer,
  OfferSub,
  OfferApplicableProduct,
  Coupon
} = require("../../models");
const { calculateCartDiscount } = require("../../services/discount.service");
const CartCoupon = require("../../models/offers/cartCoupon.model");



exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // 1️⃣ Fetch Saved Coupon (if exists)
    const savedCoupon = await CartCoupon.findOne({
      where: { userId }
    });

    const couponCode = savedCoupon?.couponCode || null;

    // 2️⃣ Fetch Cart Items
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
      ],
      order: [["createdAt", "DESC"]]
    });

    let itemsCount = cartItems.length;
    let totalQuantity = 0;

    let subTotal = 0;
    let totalOriginalAmount = 0;
    let productOfferDiscount = 0;
    
    // 🔥 NEW: Track eligible amount for coupon (items without offers)
    let eligibleForCouponTotal = 0; // Original amount of items without offers
    let eligibleItemsCount = 0;
    let itemsWithOffersCount = 0;

    // 3️⃣ Fetch Active Offers
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

    const processedItems = [];

    // 4️⃣ Process Each Cart Item (Product Offers)
    for (let item of cartItems) {

      const sellingPrice = Number(item.product?.price?.sellingPrice || 0);
      const gstRate = Number(item.product?.gstRate || 0);
      const quantity = item.quantity;
      const currentStock = item.variantSize?.stock || 0;

      const isAvailable = currentStock > 0;
      const validQuantity = isAvailable
        ? Math.min(quantity, currentStock)
        : 0;

      totalQuantity += validQuantity;

      const originalAmount = sellingPrice * validQuantity;
      totalOriginalAmount += originalAmount;

      let itemDiscount = 0;
      let offerApplied = false;
      let offerDetails = null;

      // Offer Check
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
          offerDetails = {
            type: "PERCENTAGE",
            value: subOffer.discountValue,
            maxDiscount: subOffer.maxDiscount
          };
        } else if (subOffer.discountType === "FLAT") {
          itemDiscount = subOffer.discountValue;
          offerDetails = {
            type: "FLAT",
            value: subOffer.discountValue
          };
        }

        offerApplied = true;
        break;
      }

      const finalAmount = originalAmount - itemDiscount;

      if (isAvailable) {
        subTotal += finalAmount;
        productOfferDiscount += itemDiscount;
        
        // 🔥 Track eligible amount for coupon
        if (!offerApplied) {
          eligibleForCouponTotal += originalAmount; // Add original amount for eligible items
          eligibleItemsCount++;
        } else {
          itemsWithOffersCount++;
        }
      }

      processedItems.push({
        cartId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        sizeId: item.sizeId,

        title: item.product?.title || "Unknown Product",

        variant: {
          color: item.variant?.colorName,
          size: item.variantSize?.size,
          stock: currentStock,
          status: isAvailable ? "In Stock" : "Out of Stock",
          isAvailable
        },

        price: sellingPrice,
        quantity: validQuantity,
        originalAmount,
        itemDiscount,
        finalAmount,
        gstRate,
        offerApplied,
        offerDetails // Include offer details if applied
      });
    }

    // ===============================
    // 🔥 COUPON LOGIC (Fixed - Only on Eligible Items)
    // ===============================

    let couponDiscount = 0;
    let appliedCoupon = null;
    let couponDetails = null;

    if (couponCode && eligibleForCouponTotal > 0) {
      const coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          isActive: true,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now }
        }
      });

      if (coupon) {
        // Check minimum cart value on eligible items only
        const minCartValue = Number(coupon.minCartValue) || 0;
        
        if (eligibleForCouponTotal >= minCartValue) {
          
          if (coupon.discountType === "PERCENTAGE") {
            // Calculate discount based on eligible items only
            let discount = (eligibleForCouponTotal * Number(coupon.discountValue || 0)) / 100;

            // Apply max discount cap if exists
            const maxDiscount = Number(coupon.maxDiscount || 0);
            if (maxDiscount > 0) {
              discount = Math.min(discount, maxDiscount);
            }

            couponDiscount = discount;
            
            couponDetails = {
              type: "PERCENTAGE",
              value: coupon.discountValue,
              maxDiscount: maxDiscount || null,
              calculatedOn: eligibleForCouponTotal,
              calculation: `${coupon.discountValue}% of ₹${eligibleForCouponTotal} = ₹${discount}`
            };
          } else if (coupon.discountType === "FLAT") {
            // Flat discount, but ensure it doesn't exceed eligible amount
            const flatDiscount = Number(coupon.discountValue || 0);
            couponDiscount = Math.min(flatDiscount, eligibleForCouponTotal);
            
            couponDetails = {
              type: "FLAT",
              value: flatDiscount,
              calculatedOn: eligibleForCouponTotal,
              calculation: couponDiscount < flatDiscount 
                ? `Adjusted to ₹${couponDiscount} (cannot exceed eligible items total)`
                : `Flat ₹${flatDiscount} discount applied`
            };
          }

          appliedCoupon = coupon.code;
        } else {
          // Coupon exists but doesn't meet min cart value on eligible items
          console.log(`Coupon ${couponCode} requires ₹${minCartValue} on eligible items, but only ₹${eligibleForCouponTotal} available`);
        }
      }
    }

    // Final subtotal after coupon
    const finalSubTotal = subTotal - couponDiscount;

    // ===============================
    // 🔥 GST CALCULATION (After Discounts)
    // ===============================

    let taxAmount = 0;
    let itemizedTax = [];

    for (let item of processedItems) {
      if (!item.variant.isAvailable) continue;

      // Calculate proportion of this item in the eligible subtotal
      // For items with offers, they don't get coupon discount
      let itemAfterCoupon = item.finalAmount;
      
      if (appliedCoupon && !item.offerApplied) {
        // Only apply coupon proportion to eligible items (without offers)
        const eligibleProportion = eligibleForCouponTotal > 0 
          ? item.originalAmount / eligibleForCouponTotal 
          : 0;
        itemAfterCoupon = item.finalAmount - (couponDiscount * eligibleProportion);
      }

      const itemTax = Math.round((itemAfterCoupon * item.gstRate) / 100);
      taxAmount += itemTax;
      
      itemizedTax.push({
        productId: item.productId,
        title: item.title,
        baseAmount: itemAfterCoupon,
        gstRate: item.gstRate,
        taxAmount: itemTax
      });
    }

    // ===============================
    // 🚚 SHIPPING
    // ===============================

    const shippingFee = finalSubTotal > 5000 || finalSubTotal === 0 ? 0 : 150;
    const grandTotal = finalSubTotal + taxAmount + shippingFee;

    // ===============================
    // 📊 Summary Statistics
    // ===============================

    return res.status(200).json({
      success: true,
      data: {
        items: processedItems
      },
      summary: {
        // Cart totals
        itemsCount,
        totalQuantity,
        totalOriginalAmount,
        productOfferDiscount,
        subTotal, // After product offers, before coupon
        
        // Coupon breakdown
        couponDiscount,
        finalSubTotal, // After all discounts
        
        // Tax
        tax: { 
          amount: taxAmount,
          breakdown: itemizedTax 
        },
        
        // Shipping
        shippingFee,
        grandTotal,
        currency: "INR",
        
        // Applied coupon info
        appliedCoupon,
        couponDetails,
        
        // 🔥 NEW: Eligible items info
        couponEligibility: {
          eligibleAmount: eligibleForCouponTotal,
          eligibleItemsCount,
          itemsWithOffersCount,
          meetsMinCartValue: appliedCoupon ? true : false,
          requiredMinValue: appliedCoupon ? Number(couponDetails?.minCartValue || 0) : null
        },

        canCheckout:
          processedItems.length > 0 &&
          processedItems.every(
            i => i.variant.isAvailable && i.quantity > 0
          )
      }
    });

  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

// exports.addToCart = async (req, res) => {
//   try {
//     const { productId, variantId, sizeId } = req.body;
//     const userId = req.user.id;

//     // Validate variant belongs to product
//     const validVariant = await ProductVariant.findOne({
//       where: { id: variantId, productId },
//     });

//     if (!validVariant) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid variant for this product",
//       });
//     }

//     // Validate size belongs to variant
//     const validSize = await VariantSize.findOne({
//       where: { id: sizeId, variantId },
//     });

//     if (!validSize) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid size for this variant",
//       });
//     }

//     const [item, created] = await CartItem.findOrCreate({
//       where: { userId, productId, variantId, sizeId },
//       defaults: { quantity: 1 },
//     });

//     if (!created) {
//       await item.increment("quantity", { by: 1 });
//     }

//     res.json({ success: true, message: "Added to cart" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

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
          action: 'updated'
        }
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
          action: 'created'
        }
      });
    }

  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
          attributes: ['stock']
        }
      ]
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
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
        sizeId
      }
    });

  } catch (error) {
    console.error("Increment Cart Quantity Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
