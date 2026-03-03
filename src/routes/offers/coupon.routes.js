// const express = require("express");
// const router = express.Router();
// const couponController = require("../../controllers/offers/coupon.controller");
// const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");
// const { protected } = require("../../middleware/user.logout.middleware");

// //admin side
// router.post("/", adminAuthMiddleware, couponController.createCoupon);
// router.get("/", adminAuthMiddleware, couponController.getCoupons);
// router.put("/:id",adminAuthMiddleware, couponController.updateCoupon);
// router.patch("/:id/deactivate", adminAuthMiddleware, couponController.deactivateCoupon);


// // USER SIDE
// router.post("/apply", protected, couponController.applyCoupon);
// router.get("/active", protected, couponController.getActiveCouponsForUser);

// module.exports = router;






// routes/offers/coupon.routes.js

const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/offers/coupon.controller");
const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");
const { protected } = require("../../middleware/user.logout.middleware");

// Admin routes
router.post("/", adminAuthMiddleware, couponController.createCoupon);
router.get("/", adminAuthMiddleware, couponController.getCoupons);
router.put("/:id", adminAuthMiddleware, couponController.updateCoupon);
router.patch("/:id/deactivate", adminAuthMiddleware, couponController.deactivateCoupon);

// User routes
router.post("/apply", protected, couponController.applyCoupon); // Apply new coupon (auto-removes old)
router.delete("/remove", protected, couponController.removeCoupon); // Remove current coupon
router.get("/applied", protected, couponController.getAppliedCoupon); // Get currently applied coupon
router.get("/active", protected, couponController.getActiveCouponsForUser); // Get all active coupons with eligibility

module.exports = router;