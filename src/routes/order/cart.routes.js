const router = require("express").Router();
const cartCtrl = require("../../controllers/order/cart.controller");
const { protect } = require("../../middleware/user.auth.middleware");
const {protected} = require("../../middleware/user.logout.middleware")

router.use(protected); // All cart actions require a logged-in user

router.get("/", cartCtrl.getCart);
router.post("/add", cartCtrl.addToCart);
router.post("/merge", cartCtrl.mergeGuestCart);
router.patch("/decrease/:id", cartCtrl.decreaseQuantity);
router.post("/increase", cartCtrl.incrementCartQuantity);
router.delete("/item/:cartItemId",  cartCtrl.deleteCartItem);

module.exports = router;