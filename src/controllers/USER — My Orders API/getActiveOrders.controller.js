// const { Order } = require("../../models");

// exports.getActiveOrders = async (req, res) => {
// const orders = await Order.findAll({
// where: {
// userId: req.user.id,
// status: ["confirmed", "packed", "shipped", "out_for_delivery"],
// },
// order: [["createdAt", "DESC"]],
// });


// res.json({ success: true, data: orders });
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

exports.getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        userId: req.user.id,
        status: ["confirmed", "packed", "shipped", "out_for_delivery"],
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

    // 🔹 Format response same as admin API
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

    res.json({
      success: true,
      total: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
