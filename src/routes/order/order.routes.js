const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order/order.controller');
const { protect } = require('../../middleware/user.auth.middleware');

// Create Order (Requires Login)
router.post('/place', protect, orderController.placeOrder);

// Payment Webhook (Public, called by Razorpay/Stripe)
// router.post('/webhook/payment', orderController.handlePaymentWebhook);

router.post("/payment/icici/callback", orderController.iciciCallback);


module.exports = router;