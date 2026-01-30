const { Order, OrderItem, Product, CartItem, sequelize } = require("../models");

exports.handlePaymentWebhook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        // 1. Verify the signature (Standard security step for Razorpay/Stripe)
        // const isValid = verifySignature(req.body, req.headers['x-razorpay-signature']);
        
        const { orderNumber, transactionId } = req.body; // Data from gateway

        // 2. Find the pending order
        const order = await Order.findOne({ 
            where: { orderNumber, status: 'pending' },
            include: [{ model: OrderItem }],
            transaction: t 
        });

        if (!order) {
            throw new Error("Order not found or already processed");
        }

        // 3. Update Order Status
        await order.update({
            status: 'confirmed',
            paymentStatus: 'paid',
            transactionId: transactionId
        }, { transaction: t });

        // 4. Deduct Inventory Stock
        for (const item of order.OrderItems) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                await product.decrement('stockQuantity', { by: item.quantity, transaction: t });
            }
        }

        // 5. Clear User's Cart
        await CartItem.destroy({
            where: { userId: order.userId },
            transaction: t
        });

        await t.commit();
        res.status(200).json({ success: true, message: "Order finalized successfully" });

    } catch (error) {
        await t.rollback();
        console.error("Webhook Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};