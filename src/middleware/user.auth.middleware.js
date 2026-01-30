const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers (format: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extract token from string
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in the database and attach to request (excluding password)
      // This allows you to access 'req.user' in any controller
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }
      });

      if (!req.user) {
        return res.status(401).json({ success: false, message: "User no longer exists" });
      }

      next(); // Move to the next function (Controller)
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };