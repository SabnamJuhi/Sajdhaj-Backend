const { 
    Order, 
    OrderItem, 
    OrderAddress, 
    CartItem, 
    Product, 
    sequelize 
} = require("../models");
const { generateOrderNumber } = require("../utils/helpers");



exports.placeOrder = async (req, res) => {
    // 1. Start a Managed Transaction
    const t = await sequelize.transaction();

    try {
        const userId = req.user.id; // From auth middleware
        const { shippingAddress, paymentMethod } = req.body;

        // 2. Get User's Cart Items
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{ model: Product }],
            transaction: t
        });

        if (!cartItems.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 3. Validate Inventory & Calculate Totals
        let subtotal = 0;
        for (const item of cartItems) {
            if (item.Product.stockQuantity < item.quantity) {
                throw new Error(`Item ${item.Product.title} is out of stock`);
            }
            subtotal += item.Product.sellingPrice * item.quantity;
        }

        const shippingFee = subtotal > 1000 ? 0 : 500; // Example logic
        const totalAmount = subtotal + shippingFee;

        // 4. Create the Order Header
        const order = await Order.create({
            userId,
            orderNumber: generateOrderNumber(),
            subtotal,
            shippingFee,
            totalAmount,
            status: 'pending',
            paymentMethod,
            paymentStatus: 'unpaid'
        }, { transaction: t });

        // 5. Create Order Items (Snapshots)
        const orderItemsData = cartItems.map(item => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.Product.title,
            quantity: item.quantity,
            priceAtPurchase: item.Product.sellingPrice,
            totalPrice: item.Product.sellingPrice * item.quantity
        }));

        await OrderItem.bulkCreate(orderItemsData, { transaction: t });

        // 6. Save Shipping Address
        await OrderAddress.create({
            orderId: order.id,
            ...shippingAddress
        }, { transaction: t });

        // 7. Commit Transaction
        await t.commit();

        // 8. Handle Payment Integration here (e.g., return Razorpay Order ID)
        res.status(201).json({
            success: true,
            message: "Order initiated",
            orderNumber: order.orderNumber,
            total: totalAmount
        });

    } catch (error) {
        // Rollback if anything fails
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};




// STEP 2: Finalize Order (Webhook from Payment Gateway)
exports.handlePaymentWebhook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { orderNumber, transactionId } = req.body;
        const order = await Order.findOne({ 
            where: { orderNumber, status: 'pending' }, 
            include: [OrderItem], transaction: t 
        });

        if (!order) throw new Error("Order not found");

        await order.update({ status: 'confirmed', paymentStatus: 'paid', transactionId }, { transaction: t });

        for (const item of order.OrderItems) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            await product.decrement('stockQuantity', { by: item.quantity, transaction: t });
        }

        await CartItem.destroy({ where: { userId: order.userId }, transaction: t });

        await t.commit();
        res.status(200).json({ success: true, message: "Order confirmed" });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};