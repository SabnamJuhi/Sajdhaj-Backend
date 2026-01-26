const router = require("express").Router()
const {
  upsertVariants,
  getVariantsByProduct,
  deleteVariantsbyProduct,
  deleteVariantByCode
} = require("../../controllers/products/productVariant.controller")

router.post("/", upsertVariants)
router.get("/:productId", getVariantsByProduct)
router.delete("/product/:productId", deleteVariantsbyProduct)
router.delete("/:variantCode", deleteVariantByCode)

module.exports = router
