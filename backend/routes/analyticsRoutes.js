const express = require("express");

const {
  getAnalytics,
  getChartData,
  getCampaignAnalytics,
} = require("../controllers/analyticsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Analytics data fetch karna
router.get("/", authMiddleware, getAnalytics);

// Chart data fetch karna (daily/weekly/monthly)
router.get("/chart", authMiddleware, getChartData);

// Individual campaign analytics
router.get("/campaign/:id", authMiddleware, getCampaignAnalytics);

module.exports = router;