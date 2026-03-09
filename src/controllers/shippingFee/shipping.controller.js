// controllers/admin/settings.controller.js
const ShippingSetting = require("../../models/shippingFee/shipping.model");

exports.createShippingSettings = async (req, res) => {
  try {
    const { shippingFee } = req.body;

    // Debug log to see what's in req.admin or req.user
    console.log("Admin Auth Data:", req.admin || req.user);

    // Get admin ID from the middleware (check both possible locations)
    const adminId = req.admin?.id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated properly",
      });
    }

    // Validation
    if (shippingFee === undefined || shippingFee === null) {
      return res.status(400).json({
        success: false,
        message: "Shipping fee is required",
      });
    }

    if (isNaN(shippingFee) || shippingFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid shipping fee (positive number) is required",
      });
    }

    // Check if settings already exist
    const existingSettings = await ShippingSetting.findOne();
    
    if (existingSettings) {
      return res.status(400).json({
        success: false,
        message: "Shipping settings already exist. Use update API to modify.",
      });
    }

    // Create new shipping settings
    const settings = await ShippingSetting.create({
      shippingFee: Number(shippingFee),
      updatedBy: adminId,
    });

    return res.status(201).json({
      success: true,
      message: "Shipping settings created successfully",
      data: settings,
    });

  } catch (error) {
    console.error("Create Shipping Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create shipping settings",
    });
  }
};

/**
 * Get shipping settings
 * GET /api/admin/settings/shipping
 */
exports.getShippingSettings = async (req, res) => {
  try {
    const settings = await ShippingSetting.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Shipping settings not found. Please create them first.",
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Shipping Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipping settings",
    });
  }
};

/**
 * Update shipping settings
 * PUT /api/admin/settings/shipping
 */
exports.updateShippingSettings = async (req, res) => {
  try {
    const { shippingFee } = req.body;

    // Get admin ID from the middleware
    const adminId = req.admin?.id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated properly",
      });
    }

    // Validation
    if (shippingFee === undefined || shippingFee === null) {
      return res.status(400).json({
        success: false,
        message: "Shipping fee is required",
      });
    }

    if (isNaN(shippingFee) || shippingFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid shipping fee (positive number) is required",
      });
    }

    const settings = await ShippingSetting.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Shipping settings not found. Please create them first.",
      });
    }

    // Update existing settings
    await settings.update({
      shippingFee: Number(shippingFee),
      updatedBy: adminId,
    });

    return res.status(200).json({
      success: true,
      message: "Shipping settings updated successfully",
      data: settings,
    });

  } catch (error) {
    console.error("Update Shipping Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update shipping settings",
    });
  }
};