const { Category, SubCategory } = require("../../models")

exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body

    if (!name || !categoryId) {
      return res.status(400).json({ message: "Name and Category ID required" })
    }

    const category = await Category.findByPk(categoryId)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    const subCategory = await SubCategory.create({
      name,
      categoryId
    })

    res.status(201).json({
      success: true,
      message: "Subcategory created",
      data: subCategory
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: {
        model: Category,
        as: "category", 
        attributes: ["id", "name"]
      }
    })

    res.status(200).json({ success: true, data: subCategories })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params

    const subCategories = await SubCategory.findAll({
      where: {
        categoryId,
        isActive: true
      }
    })

    res.status(200).json({ success: true, data: subCategories })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    const subCategory = await SubCategory.findByPk(id)
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" })
    }

    subCategory.name = name || subCategory.name
    await subCategory.save()

    res.status(200).json({
      success: true,
      message: "Subcategory updated",
      data: subCategory
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params

    const subCategory = await SubCategory.findByPk(id)
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" })
    }

    subCategory.isActive = false
    await subCategory.save()

    res.status(200).json({
      success: true,
      message: "Subcategory deleted"
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

