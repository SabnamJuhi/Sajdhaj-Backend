// routes/banner/collectionBanner.routes.js

const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const {
  createCollectionBanner,
  getAllCollectionBanners,
  getActiveCollectionBanners,
  getCollectionBannerById,
  updateCollectionBanner,
  softDeleteCollectionBanner,
  restoreCollectionBanner,
  deleteCollectionBanner,
} = require("../../controllers/banner/collectionBanner.controller");
const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");

// Public routes
router.get("/active", getActiveCollectionBanners);
router.get("/:id", getCollectionBannerById);

// Admin routes
router.post("/", adminAuthMiddleware, upload.single("image"), createCollectionBanner);
router.get("/", getAllCollectionBanners);
router.put("/:id", adminAuthMiddleware, upload.single("image"), updateCollectionBanner);
router.patch("/:id/soft-delete", adminAuthMiddleware, softDeleteCollectionBanner);
router.patch("/:id/restore", adminAuthMiddleware, restoreCollectionBanner);
router.delete("/:id", adminAuthMiddleware, deleteCollectionBanner);

module.exports = router;