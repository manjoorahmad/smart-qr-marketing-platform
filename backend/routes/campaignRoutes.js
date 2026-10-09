const express = require("express");
const {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  generateQRCode,
} = require("../controllers/campaignController");
const authMiddleware = require("../middleware/authMiddleware");

// Router create karna
const router = express.Router();

// Create Campaign API
// Is route ko access karne ke liye login token required hai
router.post("/", authMiddleware, createCampaign);

// Get all campaigns of logged-in user
router.get("/", authMiddleware, getCampaigns);

// Update Campaign API
router.put("/:id", authMiddleware, updateCampaign);

// Delete Campaign API
router.delete("/:id", authMiddleware, deleteCampaign);

// Generate QR Code API
router.post("/:id/qr", authMiddleware, generateQRCode);

module.exports = router;