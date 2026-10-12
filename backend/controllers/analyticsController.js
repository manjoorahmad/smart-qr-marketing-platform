const Campaign = require("../models/Campaign");
const Scan = require("../models/Scan");

// ===============================
// GET DASHBOARD ANALYTICS
// ===============================
const getAnalytics = async (req, res) => {
  try {
    // Logged-in user ki campaigns find karna
    const campaigns = await Campaign.find({
      createdBy: req.user.userId,
    });

    const now = new Date();

    // Total campaigns
    const totalCampaigns = campaigns.length;

    // Real-time calculated campaign statuses based on server time
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.getEffectiveStatus(now) === "active"
    ).length;

    const scheduledCampaigns = campaigns.filter(
      (campaign) => campaign.getEffectiveStatus(now) === "scheduled"
    ).length;

    const expiredCampaigns = campaigns.filter(
      (campaign) => campaign.getEffectiveStatus(now) === "expired"
    ).length;

    const inactiveCampaigns = campaigns.filter(
      (campaign) => campaign.status === "inactive"
    ).length;

    // Total valid QR destination scans
    const totalScans = campaigns.reduce(
      (total, campaign) => total + (campaign.scanCount || 0),
      0
    );

    // Total expired / blocked scan attempts
    const totalExpiredScans = campaigns.reduce(
      (total, campaign) => total + (campaign.expiredScanCount || 0),
      0
    );

    // Average scans per campaign
    const avgScansPerCampaign =
      totalCampaigns > 0
        ? Math.round(totalScans / totalCampaigns)
        : 0;

    // User ki campaign IDs
    const campaignIds = campaigns.map((campaign) => campaign._id);

    // Date range filter support
    const { startDate, endDate, limit = 10 } = req.query;
    let dateFilter = { campaign: { $in: campaignIds } };

    if (startDate || endDate) {
      dateFilter.scannedAt = {};
      if (startDate) dateFilter.scannedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.scannedAt.$lte = end;
      }
    }

    // Recent scans (with limit)
    const recentScans = await Scan.find(dateFilter)
      .populate("campaign", "name")
      .sort({ scannedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      message: "Analytics fetched successfully",
      analytics: {
        totalCampaigns,
        totalScans,
        activeCampaigns,
        scheduledCampaigns,
        expiredCampaigns,
        inactiveCampaigns,
        totalExpiredScans,
        avgScansPerCampaign,
        recentScans,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// GET CHART DATA (Daily/Weekly/Monthly)
// ===============================
const getChartData = async (req, res) => {
  try {
    const { period = "daily", startDate, endDate } = req.query;

    // User ki campaigns find karna
    const campaigns = await Campaign.find({ createdBy: req.user.userId });
    const campaignIds = campaigns.map((c) => c._id);

    // Date range calculate karna
    let dateFrom;
    const dateTo = endDate ? new Date(endDate) : new Date();
    dateTo.setHours(23, 59, 59, 999);

    if (startDate) {
      dateFrom = new Date(startDate);
    } else {
      dateFrom = new Date();
      if (period === "daily") {
        dateFrom.setDate(dateFrom.getDate() - 29); // Last 30 days
      } else if (period === "weekly") {
        dateFrom.setDate(dateFrom.getDate() - 83); // Last 12 weeks
      } else if (period === "monthly") {
        dateFrom.setMonth(dateFrom.getMonth() - 11); // Last 12 months
      }
      dateFrom.setHours(0, 0, 0, 0);
    }

    // MongoDB aggregation group format
    let groupFormat;
    if (period === "daily") {
      groupFormat = {
        year: { $year: "$scannedAt" },
        month: { $month: "$scannedAt" },
        day: { $dayOfMonth: "$scannedAt" },
      };
    } else if (period === "weekly") {
      groupFormat = {
        year: { $year: "$scannedAt" },
        week: { $week: "$scannedAt" },
      };
    } else {
      groupFormat = {
        year: { $year: "$scannedAt" },
        month: { $month: "$scannedAt" },
      };
    }

    // Scans aggregate karna
    const scansData = await Scan.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds },
          scannedAt: { $gte: dateFrom, $lte: dateTo },
        },
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    // Campaign wise breakdown (top 5)
    const campaignBreakdown = await Scan.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds },
          scannedAt: { $gte: dateFrom, $lte: dateTo },
        },
      },
      {
        $group: {
          _id: "$campaign",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "campaigns",
          localField: "_id",
          foreignField: "_id",
          as: "campaignInfo",
        },
      },
      {
        $project: {
          name: { $arrayElemAt: ["$campaignInfo.name", 0] },
          count: 1,
        },
      },
    ]);

    // Device breakdown
    const deviceBreakdown = await Scan.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds },
          scannedAt: { $gte: dateFrom, $lte: dateTo },
        },
      },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);

    // Browser breakdown
    const browserBreakdown = await Scan.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds },
          scannedAt: { $gte: dateFrom, $lte: dateTo },
        },
      },
      {
        $group: {
          _id: "$browser",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      message: "Chart data fetched successfully",
      chartData: {
        period,
        dateFrom,
        dateTo,
        scansOverTime: scansData,
        campaignBreakdown,
        deviceBreakdown,
        browserBreakdown,
      },
    });
  } catch (error) {
    console.error("Chart Data Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// GET INDIVIDUAL CAMPAIGN ANALYTICS
// ===============================
const getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Campaign exist karta hai aur current user ka hai
    const campaign = await Campaign.findOne({
      _id: id,
      createdBy: req.user.userId,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Date range filter
    const { startDate, endDate } = req.query;
    let dateFilter = { campaign: id };

    if (startDate || endDate) {
      dateFilter.scannedAt = {};
      if (startDate) dateFilter.scannedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.scannedAt.$lte = end;
      }
    }

    // Total scans
    const totalScans = await Scan.countDocuments({ campaign: id });

    // Recent scans
    const recentScans = await Scan.find(dateFilter)
      .sort({ scannedAt: -1 })
      .limit(10);

    // Daily scans last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyScans = await Scan.aggregate([
      {
        $match: {
          campaign: campaign._id,
          scannedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$scannedAt" },
            month: { $month: "$scannedAt" },
            day: { $dayOfMonth: "$scannedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Device breakdown
    const deviceBreakdown = await Scan.aggregate([
      { $match: { campaign: campaign._id } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]);

    // Browser breakdown
    const browserBreakdown = await Scan.aggregate([
      { $match: { campaign: campaign._id } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      message: "Campaign analytics fetched successfully",
      campaign: {
        id: campaign._id,
        name: campaign.name,
        status: campaign.status,
        effectiveStatus: campaign.getEffectiveStatus(),
        scanCount: campaign.scanCount,
        expiredScanCount: campaign.expiredScanCount || 0,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        targetUrl: campaign.targetUrl,
        createdAt: campaign.createdAt,
      },
      analytics: {
        totalScans: campaign.scanCount,
        expiredScans: campaign.expiredScanCount || 0,
        dailyScans,
        deviceBreakdown,
        browserBreakdown,
        recentScans,
      },
    });
  } catch (error) {
    console.error("Campaign Analytics Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  getAnalytics,
  getChartData,
  getCampaignAnalytics,
};