const QRCode = require("qrcode");
const Campaign = require("../models/Campaign");
const Scan = require("../models/Scan");

// ===============================
// CREATE CAMPAIGN
// ===============================
const createCampaign = async (req, res) => {
  try {
    const { name, description, targetUrl, category, startDate, endDate } = req.body;

    // Campaign name validation
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Campaign name cannot be empty",
      });
    }

    if (!name || !targetUrl) {
      return res.status(400).json({
        message: "Campaign name and target URL are required",
      });
    }

    // Target URL validate karna
    try {
      const parsedUrl = new URL(targetUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({
          message: "Target URL must use HTTP or HTTPS",
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "Please enter a valid URL, including http:// or https://",
      });
    }

    // Scheduling dates validate karna
    let parsedStartDate = null;
    let parsedEndDate = null;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ message: "Invalid start date format" });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: "Invalid end date format" });
      }
    }

    if (parsedStartDate && parsedEndDate && parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        message: "Campaign end date must be later than start date",
      });
    }

    // Naya campaign create karna
    const campaign = new Campaign({
      name: name.trim(),
      description: description ? description.trim() : "",
      targetUrl: targetUrl.trim(),
      category: category && typeof category === "string" && category.trim() ? category.trim() : "General",
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      createdBy: req.user.userId,
    });

    // Permanent scan URL for QR code
    const baseUrl = process.env.SCAN_BASE_URL || (req.get("host") ? `${req.protocol}://${req.get("host")}` : "https://smart-qr-marketing-platform.onrender.com");
    const scanUrl = `${baseUrl}/api/scans/${campaign._id}`;

    // Auto-generate default QR Code upon creation
    try {
      const defaultQr = await QRCode.toDataURL(scanUrl, {
        color: { dark: "#000000", light: "#ffffff" },
        width: 300,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      campaign.qrCode = defaultQr;
    } catch (qrErr) {
      console.warn("Auto QR generation warning:", qrErr.message);
    }

    await campaign.save();

    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error("Create Campaign Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET ALL CAMPAIGN (with search, filter, sort, pagination)
// ===============================
const getCampaigns = async (req, res) => {
  try {
    const {
      search = "",
      status,
      category,
      sort = "newest",
      page = 1,
      limit = 12,
      startDate,
      endDate,
    } = req.query;

    // Base filter - sirf logged-in user ki campaigns
    let filter = { createdBy: req.user.userId };
    const now = new Date();

    // Status filter (active, scheduled, expired, inactive)
    if (status) {
      if (status === "inactive") {
        filter.status = "inactive";
      } else if (status === "scheduled") {
        filter.status = { $ne: "inactive" };
        filter.startDate = { $gt: now };
      } else if (status === "expired") {
        filter.status = { $ne: "inactive" };
        filter.endDate = { $lt: now };
      } else if (status === "active") {
        filter.status = "active";
        filter.$and = [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        ];
      }
    }

    // Category filter
    if (category && category !== "all" && typeof category === "string" && category.trim()) {
      filter.category = category.trim();
    }

    // Search by name
    if (search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Date range filter for creation date
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Sort options
    let sortOption = {};
    if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "most-scanned") sortOption = { scanCount: -1 };
    else if (sort === "least-scanned") sortOption = { scanCount: 1 };
    else sortOption = { createdAt: -1 };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Total count for pagination
    const totalCampaigns = await Campaign.countDocuments(filter);
    const totalPages = Math.ceil(totalCampaigns / limitNum);

    const campaigns = await Campaign.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      message: "Campaigns fetched successfully",
      campaigns,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCampaigns,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get Campaigns Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET SINGLE CAMPAIGN
// ===============================
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({
      message: "Campaign fetched successfully",
      campaign,
    });
  } catch (error) {
    console.error("Get Campaign Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE CAMPAIGN (DYNAMIC DESTINATION & SCHEDULE UPDATES)
// ===============================
const updateCampaign = async (req, res) => {
  try {
    const { name, description, targetUrl, status, category, startDate, endDate } = req.body;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Campaign name empty nahi hona chahiye
    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({
        message: "Campaign name cannot be empty",
      });
    }

    // Target URL validate karna
    if (targetUrl !== undefined) {
      try {
        if (typeof targetUrl !== "string") throw new Error("Invalid URL");
        const parsedUrl = new URL(targetUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid URL protocol");
        }
      } catch (error) {
        return res.status(400).json({
          message: "Please enter a valid HTTP or HTTPS URL",
        });
      }
    }

    // Status sirf active ya inactive ho sakta hai
    if (status !== undefined && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or inactive",
      });
    }

    // Schedule dates validate karna
    let effectiveStartDate = campaign.startDate;
    let effectiveEndDate = campaign.endDate;

    if (startDate !== undefined) {
      if (startDate) {
        effectiveStartDate = new Date(startDate);
        if (isNaN(effectiveStartDate.getTime())) {
          return res.status(400).json({ message: "Invalid start date format" });
        }
      } else {
        effectiveStartDate = null;
      }
    }

    if (endDate !== undefined) {
      if (endDate) {
        effectiveEndDate = new Date(endDate);
        if (isNaN(effectiveEndDate.getTime())) {
          return res.status(400).json({ message: "Invalid end date format" });
        }
      } else {
        effectiveEndDate = null;
      }
    }

    if (effectiveStartDate && effectiveEndDate && effectiveEndDate <= effectiveStartDate) {
      return res.status(400).json({
        message: "Campaign end date must be later than start date",
      });
    }

    if (name !== undefined) campaign.name = name.trim();
    if (description !== undefined) campaign.description = description.trim();
    if (targetUrl !== undefined) campaign.targetUrl = targetUrl.trim();
    if (status !== undefined) campaign.status = status;
    if (category !== undefined) campaign.category = typeof category === "string" && category.trim() ? category.trim() : "General";
    if (startDate !== undefined) campaign.startDate = effectiveStartDate;
    if (endDate !== undefined) campaign.endDate = effectiveEndDate;

    // Notice: campaign.qrCode is preserved! The permanent QR code and scan URL remain identical.
    await campaign.save();

    res.status(200).json({
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (error) {
    console.error("Update Campaign Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE CAMPAIGN
// ===============================
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Campaign ke saath related scans bhi delete karna
    await Scan.deleteMany({ campaign: req.params.id });

    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Delete Campaign Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GENERATE QR CODE (with color customization)
// ===============================
const generateQRCode = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // QR scan hone par backend ke scan route par jayega
    const baseUrl = process.env.SCAN_BASE_URL || (req.get("host") ? `${req.protocol}://${req.get("host")}` : "https://smart-qr-marketing-platform.onrender.com");
    const scanUrl = `${baseUrl}/api/scans/${campaign._id}`;

    // Custom colors (optional, with defaults)
    const {
      darkColor = "#000000",
      lightColor = "#ffffff",
      size = 300,
    } = req.body;

    // Color validation (basic hex check)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const finalDarkColor = hexColorRegex.test(darkColor) ? darkColor : "#000000";
    const finalLightColor = hexColorRegex.test(lightColor) ? lightColor : "#ffffff";
    const finalSize = Math.min(Math.max(parseInt(size) || 300, 100), 1000);

    // QR code generate karna with custom options
    const qrCode = await QRCode.toDataURL(scanUrl, {
      color: {
        dark: finalDarkColor,
        light: finalLightColor,
      },
      width: finalSize,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    // QR code ko campaign mein save karna
    campaign.qrCode = qrCode;
    await campaign.save();

    res.status(200).json({
      message: "QR code generated successfully",
      qrCode,
      scanUrl,
    });
  } catch (error) {
    console.error("Generate QR Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  generateQRCode,
};