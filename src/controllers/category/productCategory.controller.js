const { ProductCategory } = require("../../models")

exports.createProductCategory = async (req, res) => {
  try {
    const { name, categoryId, subCategoryId } = req.body

    if (!name || !categoryId || !subCategoryId) {
      return res.status(400).json({
        message: "name, categoryId and subCategoryId are required"
      })
    }

    const productCategory = await ProductCategory.create({
      name,
      categoryId,
      subCategoryId
    })

    res.status(201).json({
      success: true,
      data: productCategory
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.getAllProductCategories = async (req, res) => {
  try {
    const data = await ProductCategory.findAll()

    res.json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.getBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params

    const data = await ProductCategory.findAll({
      where: { subCategoryId }
    })

    res.json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params

    const data = await ProductCategory.findAll({
      where: { categoryId }
    })

    res.json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.updateProductCategory = async (req, res) => {
  try {
    const { id } = req.params

    await ProductCategory.update(req.body, {
      where: { id }
    })

    res.json({
      success: true,
      message: "Product category updated"
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


exports.deleteProductCategory = async (req, res) => {
  try {
    const data = await ProductCategory.findByPk(req.params.id)
    if (!data) {
      return res.status(404).json({ message: "Not found" })
    }

    await data.destroy()
    res.status(200).json({ success: true, message: "Deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}