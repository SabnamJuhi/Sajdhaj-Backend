const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// 1. Trigger Google Login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 2. Google Callback
router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login-failed" }),
  (req, res) => {
    // Generate JWT for the user returned by Google
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Redirect to frontend with token in URL (Industry standard for SPAs)
    res.redirect(`http://localhost:5000/auth-success?token=${token}`);
  }
);

module.exports = router;