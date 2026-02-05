// const {
//   Order,
//   OrderItem,
//   OrderAddress,
//   CartItem,
//   Product,
//   ProductPrice,
//   ProductVariant,
//   sequelize,
// } = require("../../models");
// const { generateOrderNumber } = require("../../utils/helpers");
// const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// exports.placeOrder = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const userId = req.user.id;
//     const { shippingAddress, paymentMethod } = req.body;

//     // 1. Fetch Cart Items - Use distinct IDs to prevent join duplication
//     const cartItems = await CartItem.findAll({
//       where: { userId },
//       include: [
//         {
//           model: Product,
//           as: "product",
//           include: [{ model: ProductPrice, as: "price" }],
//         },
//         { model: ProductVariant, as: "variant" },
//       ],
//       transaction: t,
//     });

//     if (!cartItems.length) throw new Error("Cart is empty");

//     // 2. RESET MATH - Ensure we start from zero
//     let subtotal = 0;

//     // Use a Set to track processed Cart IDs to prevent double-counting
//     const processedIds = new Set();

//     for (const item of cartItems) {
//       if (processedIds.has(item.id)) continue; // Skip if already counted

//       const itemPrice = parseFloat(item.product.price.sellingPrice) || 0;
//       const itemQty = parseInt(item.quantity);

//       subtotal += itemPrice * itemQty;
//       processedIds.add(item.id);
//     }

//     const taxAmount = Math.round(subtotal * 0.12);
//     const shippingFee = subtotal > 5000 ? 0 : 150;
//     const totalAmount = subtotal + taxAmount + shippingFee;

//     // 3. Create Order Header (Fixing the 0.00 taxAmount bug)
//     const order = await Order.create(
//       {
//         userId,
//         orderNumber: generateOrderNumber(),
//         subtotal: subtotal,
//         taxAmount: taxAmount, // This was 0.00 in your SQL, now it's fixed
//         shippingFee: shippingFee,
//         totalAmount: totalAmount,
//         status: "pending",
//         paymentMethod,
//         paymentStatus: "unpaid",
//       },
//       { transaction: t },
//     );

//     // 4. Create Items
//     const orderItemsData = cartItems.map((item) => ({
//       orderId: order.id,
//       productId: item.productId,
//       productName: item.product.title,
//       quantity: item.quantity,
//       priceAtPurchase: item.product.price.sellingPrice,
//       totalPrice: item.product.price.sellingPrice * item.quantity,
//       variantInfo: { color: item.variant.colorName, size: item.selectedSize },
//     }));

//     await OrderItem.bulkCreate(orderItemsData, { transaction: t });

//     await OrderAddress.create(
//       { orderId: order.id, ...shippingAddress },
//       { transaction: t },
//     );

//     await t.commit();
//     const options = {
//       amount: totalAmount * 100, // Razorpay works in paise (70000 INR = 7000000 paise)
//       currency: "INR",
//       receipt: order.orderNumber,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     res.status(201).json({
//       success: true,
//       orderNumber: order.orderNumber,
//       razorpayOrderId: razorpayOrder.id, 
//       amount: razorpayOrder.amount,
//       keyId: process.env.RAZORPAY_KEY_ID,
//     });
//     // res.status(201).json({ 
//     //     success: true, orderNumber: order.orderNumber, totalAmount 
//     // });
//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // STEP 2: Finalize Order (Webhook from Payment Gateway)
// exports.handlePaymentWebhook = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { orderNumber, transactionId } = req.body;
//     const order = await Order.findOne({
//       where: { orderNumber, status: "pending" },
//       include: [OrderItem],
//       transaction: t,
//     });

//     if (!order) throw new Error("Order not found");

//     await order.update(
//       { status: "confirmed", paymentStatus: "paid", transactionId },
//       { transaction: t },
//     );

//     for (const item of order.OrderItems) {
//       const product = await Product.findByPk(item.productId, {
//         transaction: t,
//       });
//       await product.decrement("stockQuantity", {
//         by: item.quantity,
//         transaction: t,
//       });
//     }

//     await CartItem.destroy({ where: { userId: order.userId }, transaction: t });

//     await t.commit();
//     res.status(200).json({ success: true, message: "Order confirmed" });
//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
