const mongoose = require("mongoose");

// Campaign ka database structure
const campaignSchema = new mongoose.Schema(
  {
    // Campaign ka naam
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Campaign ki description
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // QR scan hone ke baad user ko kis URL par bhejna hai
    targetUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },

    // QR code ka generated data
    qrCode: {
      type: String,
    },

    // Campaign kis user ne banayi hai
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Total QR scans
    scanCount: {
      type: Number,
      default: 0,
    },

    // Campaign active hai ya nahi
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    // createdAt aur updatedAt automatically save honge
    timestamps: true,
  }
);

// Campaign model create karna
const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;