// const { Order, OrderItem, OrderAddress } = require("../../models");

// exports.getOrderHistory = async (req, res) => {
//   try {
//     const orders = await Order.findAll({
//       where: {
//         userId: req.user.id,
//         status: ["delivered", "completed", "cancelled", "refunded"],
//       },
//       include: [
//         {
//           model: OrderItem,
//         },
//         {
//           model: OrderAddress,
//           as: "address", // use alias if defined in association
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({
//       success: true,
//       total: orders.length,
//       data: orders,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };






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

exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        userId: req.user.id,
        status: ["delivered", "completed", "cancelled", "refunded"],
      },
      include: [
        {
          model: OrderAddress,
          as: "address",
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: ProductPrice, as: "price" }],
            },
            {
              model: ProductVariant,
              include: [{ model: VariantImage, as: "images", limit: 1 }],
            },
            {
              model: VariantSize,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 🔹 Format response consistent with other order APIs
    const formattedOrders = orders.map((order) => {
      const items = order.OrderItems.map((item) => {
        const sellingPrice = item.Product?.price?.sellingPrice || 0;

        return {
          orderItemId: item.id,
          productId: item.productId,
          title: item.Product?.title || "Unknown Product",
          image: item.ProductVariant?.images?.[0]?.imageUrl || null,

          variant: {
            color: item.ProductVariant?.colorName,
            size: item.VariantSize?.size,
          },

          price: sellingPrice,
          quantity: item.quantity,
          total: sellingPrice * item.quantity,
        };
      });

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,

        address: order.address,

        items,
      };
    });

    return res.json({
      success: true,
      total: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
