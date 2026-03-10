// controllers/banner/collectionBanner.controller.js

const CollectionBanner = require("../../models/banner/collectionBanner.model");
const fs = require("fs");
const path = require("path");

/* CREATE COLLECTION BANNER */
exports.createCollectionBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const { title, subtitle, description, cta, link, collectionType, productCount } = req.body;
    const imagePath = `/uploads/products/${req.file.filename}`;

    const banner = await CollectionBanner.create({
      title,
      subtitle,
      description,
      cta,
      link,
      collectionType,
      productCount: productCount || 0,
      imageUrl: imagePath,
    });

    res.json({ success: true, data: banner, message: "Collection banner created" });
  } catch (err) {
    // Clean up uploaded file if error
    if (req.file) {
      const filePath = path.join(__dirname, "../../uploads/products/", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    
    console.error("Create collection banner error:", err);
    res.status(500).json({ success: false, message: "Create failed", error: err.message });
  }
};

/* GET ALL COLLECTION BANNERS */
exports.getAllCollectionBanners = async (req, res) => {
  try {
    const banners = await CollectionBanner.findAll({
      order: [["createdAt", "DESC"]]
    });

    res.json({ success: true, data: banners });
  } catch (err) {
    console.error("Get all collection banners error:", err);
    res.status(500).json({ success: false, message: "Fetch failed", error: err.message });
  }
};

/* GET ACTIVE COLLECTION BANNERS */
exports.getActiveCollectionBanners = async (req, res) => {
  try {
    const banners = await CollectionBanner.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]]
    });

    res.json({ success: true, data: banners });
  } catch (err) {
    console.error("Get active collection banners error:", err);
    res.status(500).json({ success: false, message: "Fetch failed", error: err.message });
  }
};

/* GET COLLECTION BANNER BY ID */
exports.getCollectionBannerById = async (req, res) => {
  try {
    const banner = await CollectionBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Collection banner not found" });
    }

    res.json({ success: true, data: banner });
  } catch (err) {
    console.error("Get collection banner by ID error:", err);
    res.status(500).json({ success: false, message: "Fetch failed", error: err.message });
  }
};

/* UPDATE COLLECTION BANNER */
exports.updateCollectionBanner = async (req, res) => {
  try {
    const banner = await CollectionBanner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Collection banner not found" });
    }

    // If new image uploaded
    if (req.file) {
      // Delete old image
      if (banner.imageUrl) {
        const oldImagePath = path.join(__dirname, "../../", banner.imageUrl);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      banner.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const { title, subtitle, description, cta, link, collectionType, productCount, isActive } = req.body;

    await banner.update({
      title: title || banner.title,
      subtitle: subtitle || banner.subtitle,
      description: description !== undefined ? description : banner.description,
      cta: cta || banner.cta,
      link: link || banner.link,
      collectionType: collectionType || banner.collectionType,
      productCount: productCount !== undefined ? productCount : banner.productCount,
      isActive: isActive !== undefined ? isActive : banner.isActive,
      imageUrl: banner.imageUrl,
    });

    res.json({ success: true, data: banner, message: "Collection banner updated" });
  } catch (err) {
    console.error("Update collection banner error:", err);
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
};

/* SOFT DELETE COLLECTION BANNER */
exports.softDeleteCollectionBanner = async (req, res) => {
  try {
    const banner = await CollectionBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Collection banner not found" });
    }

    if (!banner.isActive) {
      return res.status(400).json({ success: false, message: "Collection banner is already inactive" });
    }

    await banner.update({ isActive: false });

    res.json({ 
      success: true, 
      message: "Collection banner soft deleted successfully",
      data: { id: banner.id, isActive: banner.isActive }
    });
  } catch (err) {
    console.error("Soft delete collection banner error:", err);
    res.status(500).json({ success: false, message: "Soft delete failed", error: err.message });
  }
};

/* RESTORE COLLECTION BANNER */
exports.restoreCollectionBanner = async (req, res) => {
  try {
    const banner = await CollectionBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Collection banner not found" });
    }

    if (banner.isActive) {
      return res.status(400).json({ success: false, message: "Collection banner is already active" });
    }

    await banner.update({ isActive: true });

    res.json({ 
      success: true, 
      message: "Collection banner restored successfully",
      data: { id: banner.id, isActive: banner.isActive }
    });
  } catch (err) {
    console.error("Restore collection banner error:", err);
    res.status(500).json({ success: false, message: "Restore failed", error: err.message });
  }
};

/* DELETE COLLECTION BANNER (HARD DELETE) */
exports.deleteCollectionBanner = async (req, res) => {
  try {
    const banner = await CollectionBanner.findByPk(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Collection banner not found" });
    }

    // Delete image file
    if (banner.imageUrl) {
      const imagePath = path.join(__dirname, "../../", banner.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await banner.destroy();

    res.json({ success: true, message: "Collection banner deleted permanently" });
  } catch (err) {
    console.error("Delete collection banner error:", err);
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};