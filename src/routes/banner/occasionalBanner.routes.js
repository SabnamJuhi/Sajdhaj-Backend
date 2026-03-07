// routes/banner/occasionalBanner.routes.js

const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const {
  createOccasionalBanner,
  getAllOccasionalBanners,
  getActiveOccasionalBanners,
  getOccasionalBannerById,
  updateOccasionalBanner,
  softDeleteOccasionalBanner,
  restoreOccasionalBanner,
  deleteOccasionalBanner,
} = require("../../controllers/banner/occasionalBanner.controller");
const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");

// Public routes
router.get("/active", getActiveOccasionalBanners);
router.get("/:id", getOccasionalBannerById);

// Admin routes
router.post("/", adminAuthMiddleware, upload.single("image"), createOccasionalBanner);
router.get("/", getAllOccasionalBanners);
router.put("/:id", adminAuthMiddleware, upload.single("image"), updateOccasionalBanner);
router.patch("/:id/soft-delete", adminAuthMiddleware, softDeleteOccasionalBanner);
router.patch("/:id/restore", adminAuthMiddleware, restoreOccasionalBanner);
router.delete("/:id", adminAuthMiddleware, deleteOccasionalBanner);

module.exports = router;