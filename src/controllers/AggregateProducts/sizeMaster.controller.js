const SizeMaster = require("../../models/products/sizeMaster.model");

/* ================= CREATE SIZE ================= */

exports.createSize = async (req, res) => {
  try {
    const { name, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Size name is required",
      });
    }

    const existing = await SizeMaster.findOne({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Size already exists",
      });
    }

    const size = await SizeMaster.create({
      name,
      sortOrder: sortOrder || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Size created successfully",
      data: size,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ALL SIZES ================= */

exports.getAllSizes = async (req, res) => {
  try {
    const sizes = await SizeMaster.findAll({
      order: [["sortOrder", "ASC"]],
    });

    return res.json({
      success: true,
      data: sizes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET SIZE BY ID ================= */

exports.getSizeById = async (req, res) => {
  try {
    const { id } = req.params;

    const size = await SizeMaster.findByPk(id);

    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    return res.json({
      success: true,
      data: size,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE SIZE ================= */

exports.updateSize = async (req, res) => {
  try {
    const { id } = req.params;

    const size = await SizeMaster.findByPk(id);

    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    const {
      name,
      sortOrder,
      isActive,
    } = req.body;

    await size.update({
      ...(name !== undefined && { name }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    });

    return res.json({
      success: true,
      message: "Size updated successfully",
      data: size,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE SIZE ================= */

exports.deleteSize = async (req, res) => {
  try {
    const { id } = req.params;

    const size = await SizeMaster.findByPk(id);

    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    await size.destroy();

    return res.json({
      success: true,
      message: "Size deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= REORDER SIZES ================= */

exports.reorderSizes = async (req, res) => {
  try {
    const { sizes } = req.body;

    if (!Array.isArray(sizes)) {
      return res.status(400).json({
        success: false,
        message: "sizes array is required",
      });
    }

    for (const item of sizes) {
      await SizeMaster.update(
        {
          sortOrder: item.sortOrder,
        },
        {
          where: {
            id: item.id,
          },
        }
      );
    }

    return res.json({
      success: true,
      message: "Sizes reordered successfully",
    });
  } catch (error) {
    console.error("REORDER SIZE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};