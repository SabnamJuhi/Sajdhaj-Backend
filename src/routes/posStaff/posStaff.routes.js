const express = require("express");

const router = express.Router();

const adminAuthMiddleware = require("../../middleware/admin.auth.middleware");
const verifyPos = require("../../middleware/posSatff.auth.middleware");

const {
  loginPosStaff,
  registerPosStaff,
} = require("../../controllers/posStaff.auth.controller");

router.post(
  "/register",
  adminAuthMiddleware,
  registerPosStaff
);

router.post(
  "/login",
  loginPosStaff
);

module.exports = router;