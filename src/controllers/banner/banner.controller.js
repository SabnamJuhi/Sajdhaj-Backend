const Banner = require("../../models/banner/banner.model");
// const cloudinary = require("../../config/cloudinary");
const fs = require("fs");
const path = require("path");


/* CREATE BANNER */
exports.createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const { title, subtitle, description, cta, link } = req.body;
     const imagePath = `/uploads/products/${req.file.filename}`;

    const banner = await Banner.create({
      title,
      subtitle,
      description,
      cta,
      link,
      imageUrl: imagePath,
    });

    res.json({ success: true, data: banner, message: "Banner created" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Create failed", error: err.message });
  }
};


/* GET ALL ACTIVE BANNERS */
exports.getAllBanners = async (req, res) => {
  try {
    console.log("Fetching all banners...");
    
    // Remove the attributes array completely
    const banners = await Banner.findAll({
      order: [["createdAt", "DESC"]]
    });

    console.log(`Found ${banners.length} banners`);
    
    res.json({ 
      success: true, 
      data: banners 
    });
    
  } catch (err) {
    console.error("Get All Banners Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Fetch failed", 
      error: err.message 
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

    // ✅ If new image uploaded
    if (req.file) {
      // Delete old image from local storage
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

      // Save new image path
      banner.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const { title, subtitle, description, cta, link, isActive } = req.body;

    await banner.update({
      title,
      subtitle,
      description,
      cta,
      link,
      isActive,
      imageUrl: banner.imageUrl,
    });

    res.json({
      success: true,
      data: banner,
      message: "Banner updated",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};


/* DELETE BANNER */
exports.deleteBanner = async (req, res) => {
  try {
    console.log("Delete banner request for ID:", req.params.id);
    
    const banner = await Banner.findByPk(req.params.id);
    
    if (!banner) {
      console.log("Banner not found with ID:", req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }

    console.log("Found banner:", banner.toJSON());

    // Delete image file from local storage
    if (banner.imageUrl) {
      const imagePath = path.join(__dirname, "../../", banner.imageUrl);
      console.log("Attempting to delete image at:", imagePath);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
      } else {
        console.log("Image file not found at:", imagePath);
      }
    }

    // Delete banner from database
    await banner.destroy();
    console.log("Banner deleted from database");

    res.json({ 
      success: true, 
      message: "Banner deleted successfully" 
    });
    
  } catch (err) {
    console.error("Delete banner error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      code: err.code
    });
    
    res.status(500).json({ 
      success: false, 
      message: "Delete failed",
      error: err.message 
    });
  }
};


/**
 * SOFT DELETE BANNER (set isActive to false)
 */
exports.softDeleteBanner = async (req, res) => {
  try {
    console.log("Soft delete banner request for ID:", req.params.id);
    
    const banner = await Banner.findByPk(req.params.id);
    
    if (!banner) {
      console.log("Banner not found with ID:", req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }

    console.log("Found banner:", banner.toJSON());

    // Check if already inactive
    if (!banner.isActive) {
      return res.status(400).json({
        success: false,
        message: "Banner is already inactive"
      });
    }

    // Update isActive to false (soft delete)
    await banner.update({ isActive: false });
    
    console.log("Banner soft deleted successfully");

    res.json({ 
      success: true, 
      message: "Banner soft deleted successfully (isActive = false)",
      data: {
        id: banner.id,
        title: banner.title,
        isActive: banner.isActive
      }
    });
    
  } catch (err) {
    console.error("Soft delete banner error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: "Soft delete failed",
      error: err.message 
    });
  }
};


/**
 * RESTORE BANNER (set isActive to true)
 */
exports.restoreBanner = async (req, res) => {
  try {
    console.log("Restore banner request for ID:", req.params.id);
    
    const banner = await Banner.findByPk(req.params.id);
    
    if (!banner) {
      console.log("Banner not found with ID:", req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: "Banner not found" 
      });
    }

    console.log("Found banner:", banner.toJSON());

    // Check if already active
    if (banner.isActive) {
      return res.status(400).json({
        success: false,
        message: "Banner is already active"
      });
    }

    // Update isActive to true (restore)
    await banner.update({ isActive: true });
    
    console.log("Banner restored successfully");

    res.json({ 
      success: true, 
      message: "Banner restored successfully (isActive = true)",
      data: {
        id: banner.id,
        title: banner.title,
        isActive: banner.isActive
      }
    });
    
  } catch (err) {
    console.error("Restore banner error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: "Restore failed",
      error: err.message 
    });
  }
};
