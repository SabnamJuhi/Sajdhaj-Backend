// const Banner = require("../../models/banner/banner.model");
// // const cloudinary = require("../../config/cloudinary");
// const fs = require("fs");
// const path = require("path");


// exports.createBanner = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Image is required",
//       });
//     }

//     const {
//       title,
//       subtitle,
//       description,
//       cta,
//       link,
//       categoryType,
//       bannerPosition,
//     } = req.body;

//     // Validation
//     if (!["men", "women"].includes(categoryType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid categoryType",
//       });
//     }

//     if (!["homepage", "sidebar"].includes(bannerPosition)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid bannerPosition",
//       });
//     }

//     const imagePath = `/uploads/products/${req.file.filename}`;

//     const banner = await Banner.create({
//       title,
//       subtitle,
//       description,
//       cta,
//       link,
//       categoryType,
//       bannerPosition,
//       imageUrl: imagePath,
//     });

//     res.status(201).json({
//       success: true,
//       data: banner,
//       message: "Banner created successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Create failed",
//       error: err.message,
//     });
//   }
// };

// exports.updateBanner = async (req, res) => {
//   try {
//     const banner = await Banner.findByPk(req.params.id);

//     if (!banner) {
//       return res.status(404).json({
//         success: false,
//         message: "Banner not found",
//       });
//     }

//     // Replace image
//     if (req.file) {
//       if (banner.imageUrl) {
//         const oldImagePath = path.join(
//           __dirname,
//           "../../",
//           banner.imageUrl
//         );

//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       }

//       banner.imageUrl = `/uploads/products/${req.file.filename}`;
//     }

//     const {
//       title,
//       subtitle,
//       description,
//       cta,
//       link,
//       categoryType,
//       bannerPosition,
//       isActive,
//     } = req.body;

//     await banner.update({
//       title,
//       subtitle,
//       description,
//       cta,
//       link,
//       categoryType,
//       bannerPosition,
//       isActive,
//       imageUrl: banner.imageUrl,
//     });

//     res.json({
//       success: true,
//       data: banner,
//       message: "Banner updated successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Update failed",
//       error: err.message,
//     });
//   }
// };

// exports.getAllBanners = async (req, res) => {
//   try {
//     const banners = await Banner.findAll({
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({
//       success: true,
//       data: banners,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// exports.getHomepageBanners = async (req, res) => {
//   try {
//     const banners = await Banner.findAll({
//       where: {
//         bannerPosition: "homepage",
//         isActive: true,
//       },
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({
//       success: true,
//       data: banners,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// exports.getOppositeCategoryBanners = async (req, res) => {
//   try {
//     const { category } = req.query;

//     let oppositeCategory;

//     if (category === "women") {
//       oppositeCategory = "men";
//     } else if (category === "men") {
//       oppositeCategory = "women";
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid category",
//       });
//     }

//     const banners = await Banner.findAll({
//       where: {
//         categoryType: oppositeCategory,
//         bannerPosition: "sidebar",
//         isActive: true,
//       },
//       limit: 2,
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({
//       success: true,
//       currentCategory: category,
//       bannerCategory: oppositeCategory,
//       data: banners,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


// /* DELETE BANNER */
// exports.deleteBanner = async (req, res) => {
//   try {
//     console.log("Delete banner request for ID:", req.params.id);
    
//     const banner = await Banner.findByPk(req.params.id);
    
//     if (!banner) {
//       console.log("Banner not found with ID:", req.params.id);
//       return res.status(404).json({ 
//         success: false, 
//         message: "Banner not found" 
//       });
//     }

//     console.log("Found banner:", banner.toJSON());

//     // Delete image file from local storage
//     if (banner.imageUrl) {
//       const imagePath = path.join(__dirname, "../../", banner.imageUrl);
//       console.log("Attempting to delete image at:", imagePath);
      
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//         console.log("Image deleted successfully");
//       } else {
//         console.log("Image file not found at:", imagePath);
//       }
//     }

//     // Delete banner from database
//     await banner.destroy();
//     console.log("Banner deleted from database");

//     res.json({ 
//       success: true, 
//       message: "Banner deleted successfully" 
//     });
    
//   } catch (err) {
//     console.error("Delete banner error details:", {
//       message: err.message,
//       name: err.name,
//       stack: err.stack,
//       code: err.code
//     });
    
//     res.status(500).json({ 
//       success: false, 
//       message: "Delete failed",
//       error: err.message 
//     });
//   }
// };


// /**
//  * SOFT DELETE BANNER (set isActive to false)
//  */
// exports.softDeleteBanner = async (req, res) => {
//   try {
//     console.log("Soft delete banner request for ID:", req.params.id);
    
//     const banner = await Banner.findByPk(req.params.id);
    
//     if (!banner) {
//       console.log("Banner not found with ID:", req.params.id);
//       return res.status(404).json({ 
//         success: false, 
//         message: "Banner not found" 
//       });
//     }

//     console.log("Found banner:", banner.toJSON());

//     // Check if already inactive
//     if (!banner.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: "Banner is already inactive"
//       });
//     }

//     // Update isActive to false (soft delete)
//     await banner.update({ isActive: false });
    
//     console.log("Banner soft deleted successfully");

//     res.json({ 
//       success: true, 
//       message: "Banner soft deleted successfully (isActive = false)",
//       data: {
//         id: banner.id,
//         title: banner.title,
//         isActive: banner.isActive
//       }
//     });
    
//   } catch (err) {
//     console.error("Soft delete banner error details:", {
//       message: err.message,
//       name: err.name,
//       stack: err.stack
//     });
    
//     res.status(500).json({ 
//       success: false, 
//       message: "Soft delete failed",
//       error: err.message 
//     });
//   }
// };


// /**
//  * RESTORE BANNER (set isActive to true)
//  */
// exports.restoreBanner = async (req, res) => {
//   try {
//     console.log("Restore banner request for ID:", req.params.id);
    
//     const banner = await Banner.findByPk(req.params.id);
    
//     if (!banner) {
//       console.log("Banner not found with ID:", req.params.id);
//       return res.status(404).json({ 
//         success: false, 
//         message: "Banner not found" 
//       });
//     }

//     console.log("Found banner:", banner.toJSON());

//     // Check if already active
//     if (banner.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: "Banner is already active"
//       });
//     }

//     // Update isActive to true (restore)
//     await banner.update({ isActive: true });
    
//     console.log("Banner restored successfully");

//     res.json({ 
//       success: true, 
//       message: "Banner restored successfully (isActive = true)",
//       data: {
//         id: banner.id,
//         title: banner.title,
//         isActive: banner.isActive
//       }
//     });
    
//   } catch (err) {
//     console.error("Restore banner error details:", {
//       message: err.message,
//       name: err.name,
//       stack: err.stack
//     });
    
//     res.status(500).json({ 
//       success: false, 
//       message: "Restore failed",
//       error: err.message 
//     });
//   }
// };




const Banner = require("../../models/banner/banner.model");
const Category = require("../../models/category/category.model");

const fs = require("fs");
const path = require("path");

/* CREATE BANNER */
exports.createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const {
      title,
      subtitle,
      description,
      cta,
      link,
      categoryId,
      bannerPosition,
    } = req.body;

    // Validate category
    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Validate banner position
    if (!["homepage", "sidebar"].includes(bannerPosition)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bannerPosition",
      });
    }

    const imagePath = `/uploads/products/${req.file.filename}`;

    const banner = await Banner.create({
      title,
      subtitle,
      description,
      cta,
      link,
      categoryId,
      bannerPosition,
      imageUrl: imagePath,
    });

    res.status(201).json({
      success: true,
      data: banner,
      message: "Banner created successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Create failed",
      error: err.message,
    });
  }
};

/* UPDATE BANNER */
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Replace image
    if (req.file) {
      if (banner.imageUrl) {
        const oldImagePath = path.join(
          __dirname,
          "../../",
          banner.imageUrl
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      banner.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const {
      title,
      subtitle,
      description,
      cta,
      link,
      categoryId,
      bannerPosition,
      isActive,
    } = req.body;

    // Validate category
    if (categoryId) {
      const category = await Category.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Validate banner position
    if (
      bannerPosition &&
      !["homepage", "sidebar"].includes(bannerPosition)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid bannerPosition",
      });
    }

    await banner.update({
      title,
      subtitle,
      description,
      cta,
      link,
      categoryId,
      bannerPosition,
      isActive,
      imageUrl: banner.imageUrl,
    });

    res.json({
      success: true,
      data: banner,
      message: "Banner updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};

/* GET ALL BANNERS */
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: banners,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* GET HOMEPAGE BANNERS */
exports.getHomepageBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: {
        bannerPosition: "homepage",
        isActive: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: banners,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getCategorySidebarBanners = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Convert to number
    const parsedCategoryId = Number(categoryId);

    if (isNaN(parsedCategoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId",
      });
    }

    // Find banners for same category
    const banners = await Banner.findAll({
      where: {
        categoryId: parsedCategoryId,
        bannerPosition: "sidebar",
        isActive: true,
      },

      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],

      limit: 2,

      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      categoryId: parsedCategoryId,
      total: banners.length,
      data: banners,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* DELETE BANNER */
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Delete image
    if (banner.imageUrl) {
      const imagePath = path.join(
        __dirname,
        "../../",
        banner.imageUrl
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await banner.destroy();

    res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
};

/* SOFT DELETE */
exports.softDeleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.update({
      isActive: false,
    });

    res.json({
      success: true,
      message: "Banner soft deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* RESTORE BANNER */
exports.restoreBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.update({
      isActive: true,
    });

    res.json({
      success: true,
      message: "Banner restored successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};