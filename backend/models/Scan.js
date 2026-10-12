const mongoose = require("mongoose");

// QR scan ka database structure
const scanSchema = new mongoose.Schema(
  {
    // Kis campaign ka QR scan hua
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    // Scan kis device se hua
    device: {
      type: String,
      default: "Unknown",
    },

    // Scan kis browser se hua
    browser: {
      type: String,
      default: "Unknown",
    },

    // Referrer information (source jahan se scan request aayi)
    referrer: {
      type: String,
      default: "Direct",
    },

    // Scan status: success (redirected), expired, scheduled, inactive
    status: {
      type: String,
      enum: ["success", "expired", "scheduled", "inactive"],
      default: "success",
    },

    // IP address
    ip: {
      type: String,
      default: "",
    },

    // Scan kab hua
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Scan = mongoose.model("Scan", scanSchema);

module.exports = Scan;