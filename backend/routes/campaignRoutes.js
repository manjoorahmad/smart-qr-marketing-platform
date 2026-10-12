const express = require("express");
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  generateQRCode,
} = require("../controllers/campaignController");
const authMiddleware = require("../middleware/authMiddleware");

// Router create karna
const router = express.Router();

// Create Campaign API
router.post("/", authMiddleware, createCampaign);

// Get all campaigns of logged-in user (with search, filter, sort, pagination)
router.get("/", authMiddleware, getCampaigns);

// Get single campaign by ID
router.get("/:id", authMiddleware, getCampaignById);

// Update Campaign API
router.put("/:id", authMiddleware, updateCampaign);

// Delete Campaign API
router.delete("/:id", authMiddleware, deleteCampaign);

// Generate QR Code API (with color customization)
router.post("/:id/qr", authMiddleware, generateQRCode);

module.exports = router;