// const { Order, OrderAddress, OrderItem, User } = require("../../models");

// exports.getAdminActiveOrders = async (req, res) => {
//   try {
//     const orders = await Order.findAll({
//       where: {
//         status: ["confirmed", "packed", "shipped", "out_for_delivery"],
//       },
//       include: [
//         {
//           model: OrderAddress,
//           as: "address", // ✅ REQUIRED alias
//         },
//         {
//           model: OrderItem,
//         },
//         {
//           model: User,
//           attributes: ["id", "userName", "email"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({
//       success: true,
//       total: orders.length,
//       data: orders,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

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

// exports.getAdminActiveOrders = async (req, res) => {
//   try {
//     const orders = await Order.findAll({
//       where: {
//         status: ["confirmed", "packed", "shipped", "out_for_delivery"],
//       },
//       include: [
//         {
//           model: OrderAddress,
//           as: "address",
//         },
//         {
//           model: User,
//           attributes: ["id", "userName", "email"],
//         },
//         {
//           model: OrderItem,
//           include: [
//             {
//               model: Product,
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
//     });

//     // 🔹 Transform response like cart structure
//     const formattedOrders = orders.map((order) => {
//       const items = order.OrderItems.map((item) => {
//         const sellingPrice = item.Product?.price?.sellingPrice || 0;

//         return {
//           orderItemId: item.id,
//           productId: item.productId,
//           title: item.Product?.title || "Unknown Product",
//           image: item.ProductVariant?.images?.[0]?.imageUrl || null,

//           variant: {
//             color: item.ProductVariant?.colorName,
//             size: item.VariantSize?.size,
//           },

//           price: sellingPrice,
//           quantity: item.quantity,
//           total: sellingPrice * item.quantity,
//         };
//       });

//       return {
//         orderId: order.id,
//         orderNumber: order.orderNumber,
//         status: order.status,
//         createdAt: order.createdAt,

//         customer: {
//           id: order.User?.id,
//           name: order.User?.userName,
//           email: order.User?.email,
//         },

//         address: order.address,

//         items,
//       };
//     });

//     res.json({
//       success: true,
//       total: formattedOrders.length,
//       data: formattedOrders,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };




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

// exports.getAdminActiveOrders = async (req, res) => {
//   // 🔹 Get pagination options from query
//   const paginationOptions = getPaginationOptions(req.query);
//   try {
//     const orders = await Order.findAndCountAll({
//       where: {
//         status: ["confirmed", "packed", "shipped", "out_for_delivery"],
//       },
//       include: [
//         {
//           model: OrderAddress,
//           as: "address",
//         },
//         {
//           model: User,
//           attributes: ["id", "userName", "email"],
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
//       // order: [["createdAt", "DESC"]],
//       distinct: true, // 🔥 VERY IMPORTANT (prevents wrong count with include)
//       ...paginationOptions,
//     });

//     /**
//      * 🔹 Transform response
//      */
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
//         /**
//          * 🆕 FULL ORDER TABLE DETAILS
//          */
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
//         customer: {
//           id: order.User?.id,
//           name: order.User?.userName,
//           email: order.User?.email,
//         },
//         address: order.address,
//         items,
//       };
//     });
//     // 🔹 Format final response with pagination metadata
//     const response = formatPagination(
//       { count: orders.count, rows: formattedOrders },
//       paginationOptions.currentPage,
//       paginationOptions.limit,
//     );

//     res.json({
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



// // controllers/adminOrders/getActiveOrders.controller.js

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
// const { Op } = require("sequelize");

// exports.getAdminActiveOrders = async (req, res) => {
//   try {
//     const paginationOptions = getPaginationOptions(req.query);
    
//     // Build where clause for active orders
//     const whereClause = {
//       status: ["confirmed", "processing", "shipped", "out_for_delivery"],
//     };

//     // Add date range filter if provided
//     if (req.query.startDate && req.query.endDate) {
//       whereClause.createdAt = {
//         [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
//       };
//     }

//     // Add search by order number or user
//     if (req.query.search) {
//       whereClause[Op.or] = [
//         { orderNumber: { [Op.like]: `%${req.query.search}%` } },
//         { '$User.userName$': { [Op.like]: `%${req.query.search}%` } },
//         { '$User.email$': { [Op.like]: `%${req.query.search}%` } },
//         { '$User.mobileNumber$': { [Op.like]: `%${req.query.search}%` } }
//       ];
//     }

//     const orders = await Order.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: User,
//           as: "User",
//           attributes: ["id", "userName", "email", "mobileNumber"],
//         },
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
//         // FULL ORDER DETAILS
//         orderDetails: {
//           id: order.id,
//           orderNumber: order.orderNumber,
          
//           // Discount Breakup
//           totalOriginalAmount: order.totalOriginalAmount,
//           productOfferDiscount: order.productOfferDiscount,
//           couponDiscount: order.couponDiscount,
//           totalDiscount: order.totalDiscount,
//           couponCode: order.couponCode,
          
//           // Amounts
//           subtotal: order.subtotal,
//           shippingFee: order.shippingFee,
//           taxAmount: order.taxAmount,
//           totalAmount: order.totalAmount,

//           // Status
//           status: order.status,
//           paymentStatus: order.paymentStatus,
//           paymentMethod: order.paymentMethod,
//           transactionId: order.transactionId,

//           // OTP and Delivery
//           otp: order.otp,
//           otpVerified: order.otpVerified,
//           deliveryBoyId: order.deliveryBoyId,

//           // Timeline
//           confirmedAt: order.confirmedAt,
//           shippedAt: order.shippedAt,
//           deliveredAt: order.deliveredAt,
//           completedAt: order.completedAt,
//           cancelledAt: order.cancelledAt,
//           refundedAt: order.refundedAt,

//           // Timestamps
//           createdAt: order.createdAt,
//           updatedAt: order.updatedAt,
//           userId: order.userId,
//         },

//         // CUSTOMER INFORMATION (Admin specific)
//         customer: orderJson.User ? {
//           id: orderJson.User.id,
//           name: orderJson.User.userName,
//           email: orderJson.User.email,
//           phone: orderJson.User.mobileNumber,
//         } : null,

//         // DELIVERY ADDRESS with all fields including Google Maps data
//         address: {
//           id: address.id,
//           fullName: address.fullName,
//           email: address.email,
//           mobileNumber: address.mobileNumber,
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

//         // ORDER ITEMS
//         items,

//         // ORDER SUMMARY
//         summary: {
//           totalItems: items.length,
//           totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
//           subtotal: order.subtotal,
//           totalDiscount: order.totalDiscount,
//           shippingFee: order.shippingFee,
//           taxAmount: order.taxAmount,
//           grandTotal: order.totalAmount
//         },

//         // ADMIN SPECIFIC FIELDS
//         adminNotes: {
//           orderAge: Math.ceil((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)) + " days",
//           paymentStatus: order.paymentStatus,
//           deliveryStatus: order.status,
//           requiresAction: order.status === 'confirmed' && !order.deliveryBoyId,
//         }
//       };
//     });

//     // Add summary statistics for admin
//     const statistics = {
//       totalActiveOrders: orders.count,
//       totalRevenue: formattedOrders.reduce((sum, order) => sum + order.orderDetails.totalAmount, 0),
//       totalDiscountGiven: formattedOrders.reduce((sum, order) => sum + order.orderDetails.totalDiscount, 0),
//       averageOrderValue: orders.count > 0 
//         ? formattedOrders.reduce((sum, order) => sum + order.orderDetails.totalAmount, 0) / orders.count 
//         : 0,
//     };

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
//       statistics,
//       ...response,
//     });

//   } catch (err) {
//     console.error("Admin Get Active Orders Error:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };



// controllers/adminOrders/getActiveOrders.controller.js

const {
  Order,
  OrderAddress,
  OrderItem,
  User,
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
const { Op } = require("sequelize");

exports.getAdminActiveOrders = async (req, res) => {
  try {
    const paginationOptions = getPaginationOptions(req.query);
    
    // Build where clause for active orders
    const whereClause = {
      status: ["confirmed", "processing", "shipped", "out_for_delivery"],
    };

    // Add date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }

    // Add search by order number or user
    if (req.query.search) {
      whereClause[Op.or] = [
        { orderNumber: { [Op.like]: `%${req.query.search}%` } },
        { '$User.userName$': { [Op.like]: `%${req.query.search}%` } },
        { '$User.email$': { [Op.like]: `%${req.query.search}%` } },
        { '$User.mobileNumber$': { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "userName", "email", "mobileNumber"],
        },
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
              attributes: ["id", "colorName", "colorCode", "colorSwatch"],
              include: [
                { 
                  model: VariantImage, 
                  as: "images", 
                  attributes: ["id", "imageUrl"],
                  limit: 3
                }
              ],
            },
            {
              model: VariantSize,
              as: "VariantSize",
              attributes: ["id", "size", "stock"],
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
          
          // 📊 COMPLETE PRICE BREAKDOWN
          priceBreakdown: {
            // Per Unit Pricing
            perUnit: {
              mrp: perUnitMrp,
              sellingPrice: perUnitSellingPrice,
              discountPercentage: baseDiscountPercentage,
              baseDiscount: perUnitMrp - perUnitSellingPrice,
              offerDiscount: offerDiscountPerUnit,
              finalPrice: finalAmountPerUnit,
            },
            
            // Total Pricing (with quantity)
            total: {
              mrp: Number(item.totalMrp) || (perUnitMrp * quantity),
              sellingPrice: Number(item.totalSellingPrice) || (perUnitSellingPrice * quantity),
              baseDiscount: (perUnitMrp - perUnitSellingPrice) * quantity,
              offerDiscount: offerDiscountAmount,
              totalDiscount: Number(item.totalDiscountAmount) || offerDiscountAmount,
              finalAmount: totalFinalAmount,
            },
            
            // Savings Summary
            savings: {
              totalSaved: totalSavings,
              savingsPercentage: savingsPercentage,
              youPay: totalFinalAmount,
              originalPrice: perUnitMrp * quantity,
            }
          },
          
          // 🏷️ OFFER DETAILS (if applied)
          offer: item.offerApplied ? {
            offerId: item.offerId,
            subOfferId: item.subOfferId,
            offerDiscountType: item.offerDiscountType,
            offerDiscountValue: item.offerDiscountValue,
            offerDiscountAmount: offerDiscountAmount,
            offerDiscountPerUnit: offerDiscountPerUnit,
            applied: true,
            description: item.offerDiscountType === "PERCENTAGE" 
              ? `${item.offerDiscountValue}% off (max ${item.offerDiscountValue})`
              : `Flat ₹${item.offerDiscountValue} off`
          } : {
            applied: false
          },
          
          // 💰 GST DETAILS
          gst: {
            rate: Number(item.gstRate) || 0,
            amount: Number(item.gstAmount) || 0,
            priceWithGst: Number(item.finalPrice) || totalFinalAmount,
          },
          
          // 🖼️ Product Image
          image: item.ProductVariant?.images?.[0]?.imageUrl || null,
          
          // 📦 Product Details (for reference)
          product: item.Product ? {
            id: item.Product.id,
            title: item.Product.title,
            sku: item.Product.sku,
            brandName: item.Product.brandName,
            gstRate: item.Product.gstRate,
            currentPrice: item.Product.price
          } : null
        };
      }) || [];

      // Calculate order summary with detailed breakdown
      const orderSummary = {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        
        // Original Amounts
        totalOriginalAmount: order.totalOriginalAmount,
        
        // Discounts
        productOfferDiscount: order.productOfferDiscount,
        couponDiscount: order.couponDiscount,
        totalDiscount: order.totalDiscount,
        
        // Applied Coupon
        appliedCoupon: order.couponCode ? {
          code: order.couponCode,
          discount: order.couponDiscount
        } : null,
        
        // Final Amounts
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        taxAmount: order.taxAmount,
        grandTotal: order.totalAmount,
        
        // Per Item Summary
        itemsBreakdown: items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          mrp: item.priceBreakdown.total.mrp,
          sellingPrice: item.priceBreakdown.total.sellingPrice,
          offerDiscount: item.priceBreakdown.total.offerDiscount,
          finalPrice: item.priceBreakdown.total.finalAmount,
          savings: item.priceBreakdown.savings.totalSaved
        }))
      };

      return {
        // FULL ORDER DETAILS
        orderDetails: {
          id: order.id,
          orderNumber: order.orderNumber,
          
          // Discount Breakup
          totalOriginalAmount: order.totalOriginalAmount,
          productOfferDiscount: order.productOfferDiscount,
          couponDiscount: order.couponDiscount,
          totalDiscount: order.totalDiscount,
          couponCode: order.couponCode,
          
          // Amounts
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          taxAmount: order.taxAmount,
          totalAmount: order.totalAmount,

          // Status
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          transactionId: order.transactionId,

          // OTP and Delivery
          otp: order.otp,
          otpVerified: order.otpVerified,
          deliveryBoyId: order.deliveryBoyId,

          // Timeline
          confirmedAt: order.confirmedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          completedAt: order.completedAt,
          cancelledAt: order.cancelledAt,
          refundedAt: order.refundedAt,

          // Timestamps
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          userId: order.userId,
        },

        // CUSTOMER INFORMATION
        customer: orderJson.User ? {
          id: orderJson.User.id,
          name: orderJson.User.userName,
          email: orderJson.User.email,
          phone: orderJson.User.mobileNumber,
        } : null,

        // DELIVERY ADDRESS
        address: {
          id: address.id,
          fullName: address.fullName,
          email: address.email,
          mobileNumber: address.mobileNumber,
          addressLine: address.addressLine,
          country: address.country,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          shippingType: address.shippingType || 'delivery',
          
          // Google Maps fields
          latitude: address.latitude,
          longitude: address.longitude,
          placeId: address.placeId,
          formattedAddress: address.formattedAddress,
          
          // Generated links
          googleMapsLink: address.latitude && address.longitude 
            ? `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
            : address.formattedAddress 
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.formattedAddress)}`
              : null,
          directionsLink: address.latitude && address.longitude
            ? `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`
            : null
        },

        // 📦 ORDER ITEMS WITH COMPLETE PRICING
        items,

        // 📊 ORDER SUMMARY
        summary: orderSummary,

        // ADMIN SPECIFIC FIELDS
        adminNotes: {
          orderAge: Math.ceil((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)) + " days",
          paymentStatus: order.paymentStatus,
          deliveryStatus: order.status,
          requiresAction: order.status === 'confirmed' && !order.deliveryBoyId,
          totalSavingsForCustomer: order.totalDiscount,
          averageDiscountPerItem: items.length > 0 
            ? (order.totalDiscount / items.length).toFixed(2)
            : 0,
        }
      };
    });

    // Add summary statistics for admin
    const statistics = {
      totalActiveOrders: orders.count,
      totalRevenue: formattedOrders.reduce((sum, order) => sum + order.orderDetails.totalAmount, 0),
      totalDiscountGiven: formattedOrders.reduce((sum, order) => sum + order.orderDetails.totalDiscount, 0),
      averageOrderValue: orders.count > 0 
        ? formattedOrders.reduce((sum, order) => sum + order.orderDetails.totalAmount, 0) / orders.count 
        : 0,
      totalTaxCollected: formattedOrders.reduce((sum, order) => sum + order.orderDetails.taxAmount, 0),
      totalShippingCharged: formattedOrders.reduce((sum, order) => sum + order.orderDetails.shippingFee, 0),
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
      statistics,
      ...response,
    });

  } catch (err) {
    console.error("Admin Get Active Orders Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};