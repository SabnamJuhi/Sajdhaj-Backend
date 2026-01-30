const router = require("express").Router();
const cartCtrl = require("../../controllers/order/cart.controller");
const { protect } = require("../../middleware/user.auth.middleware");

router.use(protect); // All cart actions require a logged-in user

router.get("/", cartCtrl.getCart);
router.post("/add", cartCtrl.addToCart);
router.post("/decrease", cartCtrl.decreaseQuantity);

module.exports = router;