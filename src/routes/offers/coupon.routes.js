const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/offers/coupon.controller");
const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");
const { protected } = require("../../middleware/user.logout.middleware");

//admin side
router.post("/", adminAuthMiddleware, couponController.createCoupon);
router.get("/", adminAuthMiddleware, couponController.getCoupons);
router.put("/:id",adminAuthMiddleware, couponController.updateCoupon);
router.patch("/:id/deactivate", adminAuthMiddleware, couponController.deactivateCoupon);


// USER SIDE
router.post("/apply", protected, couponController.applyCoupon);
router.get("/active", protected, couponController.getActiveCouponsForUser);

module.exports = router;