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

    // Campaign category (e.g. Marketing, Retail, Social Media, Events, etc.)
    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: 50,
    },

    // Campaign schedule: start date & time (jab campaign active hona shuru hogi)
    startDate: {
      type: Date,
      default: null,
    },

    // Campaign schedule: expiry date & time (jab campaign expire hogi)
    endDate: {
      type: Date,
      default: null,
    },

    // Expired ya blocked scan attempts count
    expiredScanCount: {
      type: Number,
      default: 0,
    },
  },
  {
    // createdAt aur updatedAt automatically save honge
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Method: Real-time effective status calculate karna (Server time ke hisaab se)
campaignSchema.methods.getEffectiveStatus = function (now = new Date()) {
  if (this.status === "inactive") {
    return "inactive";
  }
  if (this.startDate && now < new Date(this.startDate)) {
    return "scheduled";
  }
  if (this.endDate && now > new Date(this.endDate)) {
    return "expired";
  }
  return "active";
};

// Virtual property for JSON responses
campaignSchema.virtual("effectiveStatus").get(function () {
  return this.getEffectiveStatus();
});

// Campaign model create karna
const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;