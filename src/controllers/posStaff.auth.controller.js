const bcrypt = require("bcrypt");
const PosStaff = require("../models/posStaff.model");
const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");

exports.registerPosStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      confirmPassword,
    } = req.body;

    if (
      !name ||
      !email ||
      !mobile ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const exists = await PosStaff.findOne({
      where: { email },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const staff = await PosStaff.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    //   createdBy: req.admin.id,
    });

    return res.status(201).json({
      success: true,
      message: "POS staff created successfully",
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        mobile: staff.mobile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.loginPosStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const staff = await PosStaff.findOne({
      where: {
        email,
        isActive: true,
      },
    });

    if (!staff) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      staff.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: staff.id,
        type: "posStaff",
        email: staff.email,
      },
      secret,
      {
        expiresIn,
      }
    );

    return res.json({
      success: true,
      message: "POS login successful",
      token,
      staff: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};