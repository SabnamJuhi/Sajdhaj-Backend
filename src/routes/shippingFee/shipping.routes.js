// routes/admin/settings.routes.js
const router = require("express").Router();
const {
  getShippingSettings,
  updateShippingSettings,
  createShippingSettings,
} = require("../../controllers/shippingFee/shipping.controller");
const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");
const { protected } = require("../../middleware/user.logout.middleware");

router.post("/", adminAuthMiddleware, createShippingSettings);
router.get("/", protected, getShippingSettings);
router.put("/", adminAuthMiddleware, updateShippingSettings);

module.exports = router;