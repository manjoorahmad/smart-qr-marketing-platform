const Campaign = require("../models/Campaign");
const Scan = require("../models/Scan");

// ===============================
// GET CAMPAIGN ANALYTICS
// ===============================
const getAnalytics = async (req, res) => {
  try {
    // Logged-in user ki campaigns find karna
    const campaigns = await Campaign.find({
      createdBy: req.user.userId,
    });

    // Total campaigns
    const totalCampaigns = campaigns.length;

    // Active campaigns
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === "active"
    ).length;

    // Total QR scans
    const totalScans = campaigns.reduce(
      (total, campaign) => total + campaign.scanCount,
      0
    );

    // User ki campaign IDs
    const campaignIds = campaigns.map((campaign) => campaign._id);

    // Recent scans
    const recentScans = await Scan.find({
      campaign: { $in: campaignIds },
    })
      .populate("campaign", "name")
      .sort({ scannedAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Analytics fetched successfully",

      analytics: {
        totalCampaigns,
        totalScans,
        activeCampaigns,
        recentScans,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAnalytics,
};