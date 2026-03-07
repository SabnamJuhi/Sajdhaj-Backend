// controllers/banner/occasionalBanner.controller.js

const OccasionalBanner = require("../../models/banner/occasionalBanner.model");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

/* CREATE OCCASIONAL BANNER */
exports.createOccasionalBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const { title, subtitle, description, cta, link, occasionType, startDate, endDate, discountPercentage } = req.body;
    const imagePath = `/uploads/occasional-banners/${req.file.filename}`;

    const banner = await OccasionalBanner.create({
      title,
      subtitle,
      description,
      cta,
      link,
      occasionType,
      startDate,
      endDate,
      discountPercentage: discountPercentage || 0,
      imageUrl: imagePath,
    });

    res.json({ success: true, data: banner, message: "Occasional banner created" });
  } catch (err) {
    // Clean up uploaded file if error
    if (req.file) {
      const filePath = path.join(__dirname, "../../uploads/occasional-banners/", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    
    console.error("Create occasional banner error:", err);
    res.status(500).json({ success: false, message: "Create failed", error: err.message });
  }
};

/* GET ALL OCCASIONAL BANNERS */
exports.getAllOccasionalBanners = async (req, res) => {
  try {
    const banners = await OccasionalBanner.findAll({
      order: [["createdAt", "DESC"]]
    });

    res.json({ success: true, data: banners });
  } catch (err) {
    console.error("Get all occasional banners error:", err);
    res.status(500).json({ success: false, message: "Fetch failed", error: err.message });
  }
};

/* GET ACTIVE OCCASIONAL BANNERS */
exports.getActiveOccasionalBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await OccasionalBanner.findAll({
      where: { 
        isActive: true,
        [Op.or]: [
          { startDate: { [Op.lte]: now } },
          { startDate: null }
        ],
        [Op.or]: [
          { endDate: { [Op.gte]: now } },
          { endDate: null }
        ]
      },
      order: [["createdAt", "DESC"]]
    });

    res.json({ success: true, data: banners });
  } catch (err) {
    console.error("Get active occasional banners error:", err);
    res.status(500).json({ success: false, message: "Fetch failed", error: err.message });
  }
};

/* GET OCCASIONAL BANNER BY ID */
exports.getOccasionalBannerById = async (req, res) => {
  try {
    const banner = await OccasionalBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Occasional banner not found" });
    }

    res.json({ success: true, data: banner });
  } catch (err) {
    console.error("Get occasional banner by ID error:", err);
    res.status(500).json({ success: false, message: "Fetch failed", error: err.message });
  }
};

/* UPDATE OCCASIONAL BANNER */
exports.updateOccasionalBanner = async (req, res) => {
  try {
    const banner = await OccasionalBanner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Occasional banner not found" });
    }

    // If new image uploaded
    if (req.file) {
      // Delete old image
      if (banner.imageUrl) {
        const oldImagePath = path.join(__dirname, "../../", banner.imageUrl);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      banner.imageUrl = `/uploads/occasional-banners/${req.file.filename}`;
    }

    const { title, subtitle, description, cta, link, occasionType, startDate, endDate, discountPercentage, isActive } = req.body;

    await banner.update({
      title: title || banner.title,
      subtitle: subtitle || banner.subtitle,
      description: description !== undefined ? description : banner.description,
      cta: cta || banner.cta,
      link: link || banner.link,
      occasionType: occasionType || banner.occasionType,
      startDate: startDate || banner.startDate,
      endDate: endDate || banner.endDate,
      discountPercentage: discountPercentage !== undefined ? discountPercentage : banner.discountPercentage,
      isActive: isActive !== undefined ? isActive : banner.isActive,
      imageUrl: banner.imageUrl,
    });

    res.json({ success: true, data: banner, message: "Occasional banner updated" });
  } catch (err) {
    console.error("Update occasional banner error:", err);
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
};

/* SOFT DELETE OCCASIONAL BANNER */
exports.softDeleteOccasionalBanner = async (req, res) => {
  try {
    const banner = await OccasionalBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Occasional banner not found" });
    }

    if (!banner.isActive) {
      return res.status(400).json({ success: false, message: "Occasional banner is already inactive" });
    }

    await banner.update({ isActive: false });

    res.json({ 
      success: true, 
      message: "Occasional banner soft deleted successfully",
      data: { id: banner.id, isActive: banner.isActive }
    });
  } catch (err) {
    console.error("Soft delete occasional banner error:", err);
    res.status(500).json({ success: false, message: "Soft delete failed", error: err.message });
  }
};

/* RESTORE OCCASIONAL BANNER */
exports.restoreOccasionalBanner = async (req, res) => {
  try {
    const banner = await OccasionalBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Occasional banner not found" });
    }

    if (banner.isActive) {
      return res.status(400).json({ success: false, message: "Occasional banner is already active" });
    }

    await banner.update({ isActive: true });

    res.json({ 
      success: true, 
      message: "Occasional banner restored successfully",
      data: { id: banner.id, isActive: banner.isActive }
    });
  } catch (err) {
    console.error("Restore occasional banner error:", err);
    res.status(500).json({ success: false, message: "Restore failed", error: err.message });
  }
};

/* DELETE OCCASIONAL BANNER (HARD DELETE) */
exports.deleteOccasionalBanner = async (req, res) => {
  try {
    const banner = await OccasionalBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Occasional banner not found" });
    }

    // Delete image file
    if (banner.imageUrl) {
      const imagePath = path.join(__dirname, "../../", banner.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await banner.destroy();

    res.json({ success: true, message: "Occasional banner deleted permanently" });
  } catch (err) {
    console.error("Delete occasional banner error:", err);
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};