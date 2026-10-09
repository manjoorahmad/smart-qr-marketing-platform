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