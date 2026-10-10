const Scan = require("../models/Scan");
const Campaign = require("../models/Campaign");

// ===============================
// TRACK QR SCAN
// ===============================
const trackScan = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }


    // Check karna ki campaign active hai ya nahi
    if (campaign.status !== "active") {
       return res.status(403).send("This campaign is inactive.");
    }

    // QR scan karne wale device ki information
    const userAgent = req.headers["user-agent"] || "Unknown";

    // Basic device detection
    let device = "Desktop";

    if (/mobile/i.test(userAgent)) {
      device = "Mobile";
    } else if (/tablet/i.test(userAgent)) {
      device = "Tablet";
    }

    // Basic browser detection
    let browser = "Unknown";

    if (/edg/i.test(userAgent)) {
      browser = "Edge";
    } else if (/chrome/i.test(userAgent)) {
      browser = "Chrome";
    } else if (/firefox/i.test(userAgent)) {
      browser = "Firefox";
    } else if (/safari/i.test(userAgent)) {
      browser = "Safari";
    }

    // Scan database me save karna
    await Scan.create({
      campaign: campaign._id,
      device,
      browser,
    });

    // Campaign ka scan count increase karna
    campaign.scanCount += 1;

    await campaign.save();

    // Original target URL par redirect karna
    res.redirect(campaign.targetUrl);
  } catch (error) {
    console.error("Track Scan Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  trackScan,
};