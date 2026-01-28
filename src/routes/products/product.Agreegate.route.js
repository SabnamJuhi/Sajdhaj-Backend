// const express = require("express")
// const router = express.Router()

// const productAggregateController = require("../../controllers/products/product-aggregate.controller")

// console.log("Controller import:", productAggregateController)

// router.post(
//   "/",
//   productAggregateController.createProduct
// )

// module.exports = router




const express = require("express")
const router = express.Router()

const productController = require("../../controllers/product.aggregate.controller")

router.post("/create", productController.createProduct)
router.get("/:id", productController.getProductById)
router.put("/:id", productController.updateProductDetails)


module.exports = router
