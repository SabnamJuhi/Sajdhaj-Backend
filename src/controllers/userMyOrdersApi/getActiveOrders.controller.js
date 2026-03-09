
// const {
//   Order,
//   OrderAddress,
//   OrderItem,
//   Product,
//   ProductPrice,
//   ProductVariant,
//   VariantImage,
//   VariantSize,
// } = require("../../models");
// const {
//   getPaginationOptions,
//   formatPagination,
// } = require("../../utils/paginate");

// exports.getActiveOrders = async (req, res) => {
//   try {
//     const paginationOptions = getPaginationOptions(req.query);
//     const orders = await Order.findAndCountAll({
//       where: {
//         userId: req.user.id,
//         status: ["confirmed", "packed", "shipped", "out_for_delivery"],
//       },
//       include: [
//         {
//           model: OrderAddress,
//           as: "address",
//         },
//         {
//           model: OrderItem,
//           include: [
//             {
//               model: Product,
//               attributes: ["id", "title", "sku"],
//               include: [{ model: ProductPrice, as: "price" }],
//             },
//             {
//               model: ProductVariant,
//               include: [{ model: VariantImage, as: "images", limit: 1 }],
//             },
//             {
//               model: VariantSize,
//             },
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//       distinct: true,
//       ...paginationOptions,
//     });

//     // Format response SAME as admin APIs
//     const formattedOrders = orders.rows.map((order) => {
//       const items = order.OrderItems.map((item) => {
//         const sellingPrice = item.Product?.price?.sellingPrice || 0;

//         return {
//           orderItemId: item.id,
//           productId: item.productId,
//           title: item.Product?.title || "Unknown Product",
//           image: item.ProductVariant?.images?.[0]?.imageUrl || null,

//           variant: {
//             color: item.ProductVariant?.colorName || null,
//             size: item.VariantSize?.size || null,
//           },

//           price: sellingPrice,
//           quantity: item.quantity,
//           total: sellingPrice * item.quantity,
//         };
//       });

//       return {
//         // FULL ORDER TABLE DETAILS
//         orderDetails: {
//           id: order.id,
//           orderNumber: order.orderNumber,
//           subtotal: order.subtotal,
//           shippingFee: order.shippingFee,
//           taxAmount: order.taxAmount,
//           totalAmount: order.totalAmount,

//           status: order.status,
//           paymentStatus: order.paymentStatus,
//           paymentMethod: order.paymentMethod,
//           transactionId: order.transactionId,

//           deliveryOtp: order.deliveryOtp,
//           otpVerified: order.otpVerified,
//           otp: order.otp,
//           confirmedAt: order.confirmedAt,
//           shippedAt: order.shippedAt,
//           deliveredAt: order.deliveredAt,
//           completedAt: order.completedAt,
//           cancelledAt: order.cancelledAt,
//           refundedAt: order.refundedAt,

//           createdAt: order.createdAt,
//           updatedAt: order.updatedAt,
//           userId: order.userId,
//         },

//         // ADDRESS SNAPSHOT
//         address: order.address,
//         //  ITEMS
//         items,
//       };
//     });
//     /* 🔹 Format Pagination */
//     const response = formatPagination(
//       {
//         count: orders.count, 
//         rows: formattedOrders,
//       },
//       paginationOptions.currentPage,
//       paginationOptions.limit,
//     );

//     return res.json({
//       success: true,
//       ...response,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };





// // controllers/orders/getActiveOrders.controller.js

// const {
//   Order,
//   OrderAddress,
//   OrderItem,
//   Product,
//   ProductPrice,
//   ProductVariant,
//   VariantImage,
//   VariantSize,
// } = require("../../models");
// const {
//   getPaginationOptions,
//   formatPagination,
// } = require("../../utils/paginate");

// exports.getActiveOrders = async (req, res) => {
//   try {
//     const paginationOptions = getPaginationOptions(req.query);
    
//     const orders = await Order.findAndCountAll({
//       where: {
//         userId: req.user.id,
//         status: ["confirmed", "processing", "shipped", "out_for_delivery"],
//       },
//       include: [
//         {
//           model: OrderAddress,
//           as: "address",
//           // Don't specify attributes - let Sequelize select all
//         },
//         {
//           model: OrderItem,
//           as: "OrderItems",
//           include: [
//             {
//               model: Product,
//               as: "Product",
//               attributes: ["id", "title", "sku", "brandName"],
//               include: [
//                 { 
//                   model: ProductPrice, 
//                   as: "price", 
//                   attributes: ["sellingPrice", "mrp", "discountPercentage"] 
//                 }
//               ],
//             },
//             {
//               model: ProductVariant,
//               as: "ProductVariant",
//               attributes: ["id", "colorName", "colorCode"],
//               include: [
//                 { 
//                   model: VariantImage, 
//                   as: "images", 
//                   attributes: ["id", "imageUrl"],
//                   limit: 1 
//                 }
//               ],
//             },
//             {
//               model: VariantSize,
//               as: "VariantSize",
//               attributes: ["id", "size"],
//             },
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//       distinct: true,
//       ...paginationOptions,
//     });

//     const formattedOrders = orders.rows.map((order) => {
//       const orderJson = order.toJSON();
      
//       // Get address with all fields
//       const address = orderJson.address || {};
      
//       const items = orderJson.OrderItems?.map((item) => ({
//         orderItemId: item.id,
//         productId: item.productId,
//         variantId: item.variantId,
//         sizeId: item.sizeId,
        
//         productName: item.productName || item.Product?.title,
//         variantColor: item.variantColor || item.ProductVariant?.colorName,
//         sizeLabel: item.sizeLabel || item.VariantSize?.size,
        
//         quantity: item.quantity,
//         priceAtPurchase: item.priceAtPurchase,
//         totalPrice: item.totalPrice,
//         discountAtPurchase: item.discountAtPurchase,
//         finalPrice: item.finalPrice,
//         gstRate: item.gstRate,
        
//         image: item.ProductVariant?.images?.[0]?.imageUrl || null,
        
//         product: item.Product ? {
//           id: item.Product.id,
//           title: item.Product.title,
//           sku: item.Product.sku,
//           brandName: item.Product.brandName,
//           price: item.Product.price
//         } : null
//       })) || [];

//       return {
//         orderDetails: {
//           id: order.id,
//           orderNumber: order.orderNumber,
          
//           totalOriginalAmount: order.totalOriginalAmount,
//           productOfferDiscount: order.productOfferDiscount,
//           couponDiscount: order.couponDiscount,
//           totalDiscount: order.totalDiscount,
//           couponCode: order.couponCode,
          
//           subtotal: order.subtotal,
//           shippingFee: order.shippingFee,
//           taxAmount: order.taxAmount,
//           totalAmount: order.totalAmount,

//           status: order.status,
//           paymentStatus: order.paymentStatus,
//           paymentMethod: order.paymentMethod,
//           transactionId: order.transactionId,

//           otp: order.otp,
//           otpVerified: order.otpVerified,
//           deliveryBoyId: order.deliveryBoyId,

//           confirmedAt: order.confirmedAt,
//           shippedAt: order.shippedAt,
//           deliveredAt: order.deliveredAt,
//           completedAt: order.completedAt,
//           cancelledAt: order.cancelledAt,
//           refundedAt: order.refundedAt,

//           createdAt: order.createdAt,
//           updatedAt: order.updatedAt,
//           userId: order.userId,
//         },

//         // Address with all fields including Google Maps data
//         address: {
//           id: address.id,
//           fullName: address.fullName,
//           email: address.email,
//           phoneNumber: address.phoneNumber,
//           addressLine: address.addressLine,
//           country: address.country,
//           city: address.city,
//           state: address.state,
//           zipCode: address.zipCode,
//           shippingType: address.shippingType || 'delivery',
          
//           // Google Maps fields
//           latitude: address.latitude,
//           longitude: address.longitude,
//           placeId: address.placeId,
//           formattedAddress: address.formattedAddress,
          
//           // Generated links
//           googleMapsLink: address.latitude && address.longitude 
//             ? `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
//             : address.formattedAddress 
//               ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.formattedAddress)}`
//               : null,
//           directionsLink: address.latitude && address.longitude
//             ? `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`
//             : null
//         },

//         items,

//         summary: {
//           totalItems: items.length,
//           totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
//           subtotal: order.subtotal,
//           totalDiscount: order.totalDiscount,
//           shippingFee: order.shippingFee,
//           taxAmount: order.taxAmount,
//           grandTotal: order.totalAmount
//         }
//       };
//     });

//     const response = formatPagination(
//       {
//         count: orders.count,
//         rows: formattedOrders,
//       },
//       paginationOptions.currentPage,
//       paginationOptions.limit,
//     );

//     return res.json({
//       success: true,
//       ...response,
//     });

//   } catch (err) {
//     console.error("Get Active Orders Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


// controllers/orders/getActiveOrders.controller.js

const {
  Order,
  OrderAddress,
  OrderItem,
  Product,
  ProductPrice,
  ProductVariant,
  VariantImage,
  VariantSize,
} = require("../../models");
const {
  getPaginationOptions,
  formatPagination,
} = require("../../utils/paginate");

exports.getActiveOrders = async (req, res) => {
  try {
    const paginationOptions = getPaginationOptions(req.query);
    
    const orders = await Order.findAndCountAll({
      where: {
        userId: req.user.id,
        status: ["confirmed", "processing", "shipped", "out_for_delivery"],
      },
      include: [
        {
          model: OrderAddress,
          as: "address",
        },
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["id", "title", "sku", "brandName", "gstRate"],
              include: [
                { 
                  model: ProductPrice, 
                  as: "price", 
                  attributes: ["sellingPrice", "mrp", "discountPercentage"] 
                }
              ],
            },
            {
              model: ProductVariant,
              as: "ProductVariant",
              attributes: ["id", "colorName", "colorCode"],
              include: [
                { 
                  model: VariantImage, 
                  as: "images", 
                  attributes: ["id", "imageUrl"],
                  limit: 1 
                }
              ],
            },
            {
              model: VariantSize,
              as: "VariantSize",
              attributes: ["id", "size"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
      ...paginationOptions,
    });

    const formattedOrders = orders.rows.map((order) => {
      const orderJson = order.toJSON();
      
      // Get address with all fields
      const address = orderJson.address || {};
      
      const items = orderJson.OrderItems?.map((item) => {
        // Calculate per-unit pricing
        const perUnitMrp = Number(item.mrp) || 0;
        const perUnitSellingPrice = Number(item.sellingPrice) || 0;
        const baseDiscountPercentage = Number(item.discountPercentage) || 0;
        const quantity = Number(item.quantity) || 0;
        
        // Offer details
        const offerDiscountAmount = Number(item.offerDiscountAmount) || 0;
        const offerDiscountPerUnit = quantity > 0 ? offerDiscountAmount / quantity : 0;
        
        // Final amount after offer (per unit and total)
        const finalAmountPerUnit = Number(item.finalAmount) / quantity || 0;
        const totalFinalAmount = Number(item.finalAmount) || 0;
        
        // Calculate savings
        const totalSavings = (perUnitMrp - finalAmountPerUnit) * quantity;
        const savingsPercentage = perUnitMrp > 0 
          ? ((perUnitMrp - finalAmountPerUnit) / perUnitMrp * 100).toFixed(2)
          : 0;

        return {
          orderItemId: item.id,
          
          // Product Basic Info
          productId: item.productId,
          productName: item.productName || item.Product?.title,
          
          // Variant Info
          variantId: item.variantId,
          variantInfo: item.variantInfo || {
            color: item.ProductVariant?.colorName,
            colorCode: item.ProductVariant?.colorCode,
            size: item.VariantSize?.size,
          },
          sizeId: item.sizeId,
          sizeLabel: item.VariantSize?.size,
          colorName: item.ProductVariant?.colorName,
          colorCode: item.ProductVariant?.colorCode,
          
          // Quantity
          quantity: quantity,
          
          // 🖼️ Product Image
          image: item.ProductVariant?.images?.[0]?.imageUrl || null,
          
          // 📊 SIMPLIFIED PRICE BREAKDOWN FOR USER
          priceSummary: {
            mrp: perUnitMrp,
            sellingPrice: perUnitSellingPrice,
            discountPercentage: baseDiscountPercentage,
            offerDiscount: offerDiscountPerUnit,
            finalPrice: finalAmountPerUnit,
            totalMrp: Number(item.totalMrp) || (perUnitMrp * quantity),
            totalFinal: totalFinalAmount,
            youSave: totalSavings,
            savingsPercentage: savingsPercentage
          },
          
          // 🏷️ OFFER DETAILS (if applied)
          offer: item.offerApplied ? {
            type: item.offerDiscountType,
            value: item.offerDiscountValue,
            discountAmount: offerDiscountAmount,
            description: item.offerDiscountType === "PERCENTAGE" 
              ? `${item.offerDiscountValue}% off`
              : `Flat ₹${item.offerDiscountValue} off`
          } : null,
          
          // 💰 GST
          gst: {
            rate: Number(item.gstRate) || 0,
            amount: Number(item.gstAmount) || 0
          },
          
          // Original fields (for backward compatibility)
          priceAtPurchase: item.sellingPrice,
          totalPrice: item.totalSellingPrice,
          discountAtPurchase: item.offerDiscountAmount,
          finalPrice: totalFinalAmount,
          gstRate: item.gstRate
        };
      }) || [];

      // Calculate order summary with user-friendly breakdown
      const orderSummary = {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        
        // Financial Summary
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        taxAmount: order.taxAmount,
        grandTotal: order.totalAmount,
        
        // Discount Summary
        totalDiscount: order.totalDiscount,
        couponDiscount: order.couponDiscount,
        productOfferDiscount: order.productOfferDiscount,
        
        // Applied Coupon
        appliedCoupon: order.couponCode ? {
          code: order.couponCode,
          discount: order.couponDiscount
        } : null,
        
        // Savings Summary
        totalSavings: order.totalDiscount,
        originalTotal: order.totalOriginalAmount,
        savingsPercentage: order.totalOriginalAmount > 0 
          ? ((order.totalDiscount / order.totalOriginalAmount) * 100).toFixed(1)
          : 0
      };

      return {
        orderDetails: {
          id: order.id,
          orderNumber: order.orderNumber,
          
          // Order Status
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          
          // Timeline
          confirmedAt: order.confirmedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          estimatedDelivery: order.shippedAt ? 
            new Date(new Date(order.shippedAt).setDate(new Date(order.shippedAt).getDate() + 5)) : null,
          
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },

        // Delivery Address
        address: {
          fullName: address.fullName,
          phoneNumber: address.phoneNumber,
          addressLine: address.addressLine,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          shippingType: address.shippingType || 'delivery',
          
          // Google Maps link
          googleMapsLink: address.latitude && address.longitude 
            ? `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
            : address.formattedAddress 
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.formattedAddress)}`
              : null
        },

        // Order Items with Price Breakdown
        items,

        // Order Summary
        summary: orderSummary,

        // Tracking Info (if available)
        tracking: order.deliveryBoyId ? {
          assigned: true,
          // Add tracking details if you have them
        } : {
          assigned: false
        }
      };
    });

    const response = formatPagination(
      {
        count: orders.count,
        rows: formattedOrders,
      },
      paginationOptions.currentPage,
      paginationOptions.limit,
    );

    return res.json({
      success: true,
      ...response,
    });

  } catch (err) {
    console.error("Get Active Orders Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};