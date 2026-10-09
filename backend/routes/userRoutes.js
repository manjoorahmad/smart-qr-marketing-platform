const express = require("express");

const {
  signup,
  login,
  getProfile,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

// Router create karna
const router = express.Router();

// Signup API
router.post("/signup", signup);

// Login API
router.post("/login", login);

// Protected Profile API
router.get("/profile", authMiddleware, getProfile);

module.exports = router;