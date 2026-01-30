const { Category, SubCategory, ProductCategory } = require("../../models");

//CREATE CATEGORY (Admin)
exports.createCategory = async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ message: "Category name is required" })
  }

  const exists = await Category.findOne({ where: { name } })
  if (exists) {
    return res.status(409).json({ message: "Category already exists" })
  }

  const category = await Category.create({
    name,
    description
  })

  res.status(201).json({
    message: "Category created successfully",
    category
  })
}

//GET ALL CATEGORIES (Public)
// exports.getAllCategories = async (req, res) => {
//   try {
//     const categories = await Category.findAll({
//       attributes: ["id", "name"], // ✅ Only return needed fields
//       order: [["id", "ASC"]]
//     })

//     res.status(200).json({
//       success: true,
//       data: categories
//     })
//   } catch (error) {
//     console.error("GetAllCategories Error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch categories"
//     })
//   }
// }



// GET CATEGORY BY ID (Nested with Sub and Product Categories)
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      attributes: ["id", "name"],
      include: [
        {
          model: SubCategory,
          as: "subcategories", // Must match the alias in your models/index.js
          attributes: ["id", "name"],
          include: [
            {
              model: ProductCategory,
              as: "productCategories", // Must match the alias in your models/index.js
              attributes: ["id", "name"]
            }
          ]
        }
      ]
    });

    // Check if category exists
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error("GetCategoryById Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category details",
      error: error.message
    });
  }
};

//UPDATE CATEGORY (Admin)
exports.updateCategory = async (req, res) => {
  const { name, description, isActive } = req.body

  const category = await Category.findByPk(req.params.id)
  if (!category) {
    return res.status(404).json({ message: "Category not found" })
  }

  await category.update({
    name: name ?? category.name,
    description: description ?? category.description,
    isActive: isActive ?? category.isActive
  })

  res.json({
    message: "Category updated successfully",
    category
  })
}

//DELETE CATEGORY (Admin – Soft Delete)
exports.deleteCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id)

  if (!category) {
    return res.status(404).json({ message: "Category not found" })
  }

  await category.update({ isActive: false })

  res.json({ message: "Category disabled successfully" })
}


// GET ALL CATEGORIES (Nested with Sub and Product Categories)
exports.getAllNestedCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: SubCategory,
          as: "subcategories", // Matches 'as' in models/index.js
          attributes: ["id", "name"],
          include: [
            {
              model: ProductCategory,
              as: "productCategories", // Matches 'as' in models/index.js
              attributes: ["id", "name"]
            }
          ]
        }
      ],
      order: [["id", "ASC"]]
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("GetAllCategories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};