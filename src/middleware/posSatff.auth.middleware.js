const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");

module.exports = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "POS token required",
      });
    }

    const decoded = jwt.verify(token, secret);

    if (decoded.type !== "posStaff") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    req.staff = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};