// const {
//   Order,
//   OrderAddress,
//   OrderItem,
//   User,
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

// exports.getOrderHistory = async (req, res) => {
//   try {
//     const paginationOptions = getPaginationOptions(req.query);
//     const orders = await Order.findAndCountAll({
//       where: {
//         userId: req.user.id,
//         status: ["delivered", "completed", "cancelled", "refunded"],
//       },
//       include: [
//         {
//           model: User,
//           attributes: ["id", "userName", "email"],
//         },
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
//               attributes: ["id", "colorName"],
//               include: [{ model: VariantImage, as: "images", limit: 1 }],
//             },
//             {
//               model: VariantSize,
//               attributes: ["id", "size"],
//             },
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//        distinct: true,
//       ...paginationOptions,
//     });

//     const formattedOrders = orders.rows.map((order) => {
//       const items = order.OrderItems.map((item) => {
//         const price = item.Product?.price?.sellingPrice || 0;

//         return {
//           orderItemId: item.id,
//           productId: item.productId,
//           title: item.Product?.title || "Unknown Product",
//           image: item.ProductVariant?.images?.[0]?.imageUrl || null,

//           variant: {
//             color: item.ProductVariant?.colorName || null,
//             size: item.VariantSize?.size || null,
//           },

//           price,
//           quantity: item.quantity,
//           total: price * item.quantity,
//         };
//       });

//       return {
//         // 🔹 FULL ORDER TABLE DATA
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

//         // 🔹 CUSTOMER INFO
//         customer: {
//           id: order.User?.id,
//           name: order.User?.userName,
//           email: order.User?.email,
//         },

//         // 🔹 ADDRESS
//         address: order.address || null,

//         // 🔹 ITEMS
//         items,
//       };
//     });
//  const response = formatPagination(
//       {
//         count: orders.count,
//         rows: formattedOrders,
//       },
//       paginationOptions.currentPage,
//       paginationOptions.limit
//     );

//     return res.json({
//       success: true,
//       ...response,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };





// // controllers/orders/getOrderHistory.controller.js

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

// exports.getOrderHistory = async (req, res) => {
//   try {
//     const paginationOptions = getPaginationOptions(req.query);
    
//     const orders = await Order.findAndCountAll({
//       where: {
//         userId: req.user.id,
//         status: ["delivered", "completed", "cancelled", "returned", "refunded"],
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
//         },

//         // History-specific details
//         historyDetails: {
//           orderedOn: order.createdAt,
//           deliveredOn: order.deliveredAt,
//           cancelledOn: order.cancelledAt,
//           refundedOn: order.refundedAt,
//           finalStatus: order.status === 'cancelled' ? 'Cancelled' 
//                      : order.status === 'returned' ? 'Returned'
//                      : order.status === 'refunded' ? 'Refunded'
//                      : 'Delivered'
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
//     console.error("Get Order History Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };





// controllers/orders/getOrderHistory.controller.js

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

exports.getOrderHistory = async (req, res) => {
  try {
    const paginationOptions = getPaginationOptions(req.query);
    
    const orders = await Order.findAndCountAll({
      where: {
        userId: req.user.id,
        status: ["delivered", "completed", "cancelled", "returned", "refunded"],
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
          gstRate: item.gstRate,
          
          // Product details
          product: item.Product ? {
            id: item.Product.id,
            title: item.Product.title,
            sku: item.Product.sku,
            brandName: item.Product.brandName,
            price: item.Product.price
          } : null
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

      // Determine status display and badge color
      const statusConfig = {
        // delivered: { label: 'Delivered', color: 'green', icon: 'check-circle' },
        completed: { label: 'Completed', color: 'green', icon: 'check-circle' },
        cancelled: { label: 'Cancelled', color: 'red', icon: 'x-circle' },
        returned: { label: 'Returned', color: 'orange', icon: 'refresh-cw' },
        refunded: { label: 'Refunded', color: 'blue', icon: 'dollar-sign' }
      };

      const currentStatus = statusConfig[order.status] || { label: order.status, color: 'gray' };

      return {
        orderDetails: {
          id: order.id,
          orderNumber: order.orderNumber,
          
          // Order Status with display info
          status: {
            code: order.status,
            label: currentStatus.label,
            color: currentStatus.color,
            icon: currentStatus.icon
          },
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          
          // Timeline
          confirmedAt: order.confirmedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          completedAt: order.completedAt,
          cancelledAt: order.cancelledAt,
          refundedAt: order.refundedAt,
          
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

        // History-Specific Details
        historyDetails: {
          orderedOn: order.createdAt,
          orderedDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          deliveredOn: order.deliveredAt,
          deliveredDate: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : null,
          cancelledOn: order.cancelledAt,
          cancelledDate: order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : null,
          refundedOn: order.refundedAt,
          refundedDate: order.refundedAt ? new Date(order.refundedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : null,
          
          // Refund info if applicable
          refundInfo: order.status === 'refunded' || order.status === 'returned' ? {
            amount: order.totalAmount,
            method: order.paymentMethod,
            date: order.refundedAt || order.cancelledAt
          } : null,
          
          // Return window info
          returnWindow: order.deliveredAt && order.status === 'delivered' ? {
            eligible: (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24) <= 7,
            daysLeft: Math.max(0, 7 - Math.floor((new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24))),
            expiresOn: new Date(new Date(order.deliveredAt).setDate(new Date(order.deliveredAt).getDate() + 7))
          } : null
        },

        // Actions available for this order
        actions: {
          canReorder: order.status !== 'cancelled', // Can reorder unless cancelled
          canReturn: order.status === 'delivered' && 
                    (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24) <= 7,
          canReview: order.status === 'delivered' || order.status === 'completed',
          canTrack: false, // No tracking for historical orders
        },

        // Documents
        documents: {
          invoice: `/api/orders/${order.id}/invoice`,
          // Add receipt for refunded orders
          receipt: order.status === 'refunded' || order.status === 'returned' 
            ? `/api/orders/${order.id}/receipt` 
            : null
        }
      };
    });

    // Add summary statistics for the user's order history
    const userStats = {
      totalOrders: orders.count,
      totalSpent: formattedOrders.reduce((sum, order) => sum + order.summary.grandTotal, 0),
      totalSaved: formattedOrders.reduce((sum, order) => sum + order.summary.totalSavings, 0),
      averageOrderValue: orders.count > 0 
        ? formattedOrders.reduce((sum, order) => sum + order.summary.grandTotal, 0) / orders.count 
        : 0,
      
      // Status breakdown
      statusBreakdown: {
        delivered: formattedOrders.filter(o => o.orderDetails.status.code === 'delivered').length,
        completed: formattedOrders.filter(o => o.orderDetails.status.code === 'completed').length,
        cancelled: formattedOrders.filter(o => o.orderDetails.status.code === 'cancelled').length,
        returned: formattedOrders.filter(o => o.orderDetails.status.code === 'returned').length,
        refunded: formattedOrders.filter(o => o.orderDetails.status.code === 'refunded').length,
      }
    };

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
      userStats,
      ...response,
    });

  } catch (err) {
    console.error("Get Order History Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};