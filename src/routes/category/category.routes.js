const router = require("express").Router()
const adminAuth = require("../../middleware/admin.auth.middleware")
const controller = require("../../controllers/category/category.controller")


// Category routes
router.post("/", adminAuth, controller.createCategory)
router.put("/:id", adminAuth, controller.updateCategory)
router.delete("/:id", adminAuth, controller.deleteCategory)
router.get("/", controller.getAllCategories)
router.get("/:id", controller.getCategoryById)

module.exports = router
