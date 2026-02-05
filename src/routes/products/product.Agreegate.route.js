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
const upload = require('../../middleware/upload');


router.post("/products", upload.any(), productController.createProduct)
// router.post('/variants/upload-images', upload.array('images', 5),  productController.createProduct);

// router.get("/filter", productController.getFilteredProducts);
// router.get("/filterd-product", productController.getProductFilters);
router.get("/filters", productController.getProductFilters);        // ✅ filter metadata
router.get("/products", productController.getFilteredProducts); 

router.get("/", productController.getAllProductsDetails)
router.get("/:id", productController.getProductById)
router.put("/:id", upload.any(), productController.updateProductDetails)
router.delete('/:id', productController.softDeleteProduct)
router.delete('/delete/:id', productController.deleteProductPermanently)


module.exports = router
