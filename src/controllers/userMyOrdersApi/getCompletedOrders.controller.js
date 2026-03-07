
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

// exports.getCompletedOrders = async (req, res) => {
//   try {
//       const paginationOptions = getPaginationOptions(req.query);
//     const orders = await Order.findAndCountAll({
//       where: {
//         userId: req.user.id,
//         status: "completed",
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
//                attributes: ["id", "title", "sku"],
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



// controllers/orders/getCompletedOrders.controller.js

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

exports.getCompletedOrders = async (req, res) => {
  try {
    const paginationOptions = getPaginationOptions(req.query);
    
    const orders = await Order.findAndCountAll({
      where: {
        userId: req.user.id,
        status: ["completed", "delivered"], // Include both completed and delivered statuses
      },
      include: [
        {
          model: OrderAddress,
          as: "address",
          // Don't specify attributes - let Sequelize select all
        },
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["id", "title", "sku", "brandName"],
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
      
      const items = orderJson.OrderItems?.map((item) => ({
        orderItemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        sizeId: item.sizeId,
        
        productName: item.productName || item.Product?.title,
        variantColor: item.variantColor || item.ProductVariant?.colorName,
        sizeLabel: item.sizeLabel || item.VariantSize?.size,
        
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        totalPrice: item.totalPrice,
        discountAtPurchase: item.discountAtPurchase,
        finalPrice: item.finalPrice,
        gstRate: item.gstRate,
        
        image: item.ProductVariant?.images?.[0]?.imageUrl || null,
        
        product: item.Product ? {
          id: item.Product.id,
          title: item.Product.title,
          sku: item.Product.sku,
          brandName: item.Product.brandName,
          price: item.Product.price
        } : null
      })) || [];

      return {
        orderDetails: {
          id: order.id,
          orderNumber: order.orderNumber,
          
          totalOriginalAmount: order.totalOriginalAmount,
          productOfferDiscount: order.productOfferDiscount,
          couponDiscount: order.couponDiscount,
          totalDiscount: order.totalDiscount,
          couponCode: order.couponCode,
          
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          taxAmount: order.taxAmount,
          totalAmount: order.totalAmount,

          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          transactionId: order.transactionId,

          otp: order.otp,
          otpVerified: order.otpVerified,
          deliveryBoyId: order.deliveryBoyId,

          confirmedAt: order.confirmedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          completedAt: order.completedAt,
          cancelledAt: order.cancelledAt,
          refundedAt: order.refundedAt,

          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          userId: order.userId,
        },

        // Address with all fields including Google Maps data
        address: {
          id: address.id,
          fullName: address.fullName,
          email: address.email,
          phoneNumber: address.phoneNumber,
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

        items,

        summary: {
          totalItems: items.length,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: order.subtotal,
          totalDiscount: order.totalDiscount,
          shippingFee: order.shippingFee,
          taxAmount: order.taxAmount,
          grandTotal: order.totalAmount
        },

        // Additional completion details
        completionDetails: {
          deliveredAt: order.deliveredAt,
          completedAt: order.completedAt,
          deliveryDays: order.deliveredAt 
            ? Math.ceil((new Date(order.deliveredAt) - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)) 
            : null,
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
    console.error("Get Completed Orders Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};