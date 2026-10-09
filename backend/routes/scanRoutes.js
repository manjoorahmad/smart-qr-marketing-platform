const express = require("express");

const { trackScan } = require("../controllers/scanController");

// Router create karna
const router = express.Router();

// QR Scan Tracking API
// QR scan karne ke liye login ki zarurat nahi hai
router.get("/:id", trackScan);

module.exports = router;