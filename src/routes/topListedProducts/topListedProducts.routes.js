const { getTopSoldProducts, getTopRatedProducts, getTopWishlistedProducts } = require("../../controllers/topListedProducts/getTopSoldProducts.controller");

const router = require("express").Router();


router.get("/getTopSoldProducts", getTopSoldProducts);
router.get("/getTopRatedProducts", getTopRatedProducts)
router.get("/topWishlisted", getTopWishlistedProducts);

module.exports = router;