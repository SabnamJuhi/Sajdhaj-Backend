const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order/order.controller');
const { protected } = require('../../middleware/user.logout.middleware');

// Create Order (Requires Login)
router.post('/place', protected, orderController.placeOrder);

// Payment Webhook (Public, called by Razorpay/Stripe)
// router.post('/webhook/payment', orderController.handlePaymentWebhook);

router.post("/payment/icici/callback", orderController.iciciReturn);
router.post("/payment/icici/test", orderController.iciciTestCallback);


module.exports = router;







// const express = require("express");
// const router = express.Router();
// const { encrypt, generateChecksum } = require("../utils/iciciCrypto");
// // const orderController = require('../../controllers/order/order.controller');
// // const { protect } = require('../../middleware/user.auth.middleware');

// router.post("/pay", (req, res) => {
//   const {
//     ICICI_MERCHANT_ID,
//     ICICI_SUB_MERCHANT_ID,
//     ICICI_ENCRYPTION_KEY,
//     ICICI_CHECKSUM_KEY,
//     ICICI_PAYMENT_URL,
//     ICICI_RETURN_URL
//   } = process.env;

//   const orderId = "ORD" + Date.now();

//   const paymentData = {
//     merchantid: ICICI_MERCHANT_ID,
//     submerchantid: ICICI_SUB_MERCHANT_ID,
//     orderid: orderId,
//     amount: "100.00",
//     currency: "INR",
//     ru: ICICI_RETURN_URL,
//     customername: "Ravi",
//     customeremail: "ravi@gmail.com",
//     customermobile: "9876543210"
//   };

//   const payload = JSON.stringify(paymentData);

//   const encryptedPayload = encrypt(payload, ICICI_ENCRYPTION_KEY);
//   const checksum = generateChecksum(encryptedPayload, ICICI_CHECKSUM_KEY);

//   res.json({
//     paymentUrl: ICICI_PAYMENT_URL,
//     encData: encryptedPayload,
//     checksum
//   });
// });

// module.exports = router;
