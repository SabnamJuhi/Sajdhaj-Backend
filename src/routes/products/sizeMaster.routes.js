const express = require("express");

const router = express.Router();

const {
  createSize,
  getAllSizes,
  getSizeById,
  updateSize,
  deleteSize,
  reorderSizes,
} = require("../../controllers/AggregateProducts/sizeMaster.controller");

/* ======================================================
   CRUD ROUTES
====================================================== */

router.post("/", createSize);

router.get("/", getAllSizes);

router.get("/:id", getSizeById);
router.put("/reorder", reorderSizes);

router.put("/:id", updateSize);

router.delete("/:id", deleteSize);

module.exports = router;