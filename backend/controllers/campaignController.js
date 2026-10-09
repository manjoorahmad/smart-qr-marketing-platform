const QRCode = require("qrcode");
const Campaign = require("../models/Campaign");

// ===============================
// CREATE CAMPAIGN
// ===============================
const createCampaign = async (req, res) => {
  try {
    // Frontend se campaign ki details lena
    const { name, description, targetUrl } = req.body;

    // Check karna ki required fields mili hain ya nahi
    if (!name || !targetUrl) {
      return res.status(400).json({
        message: "Campaign name and target URL are required",
      });
    }

    // Naya campaign create karna
    const campaign = await Campaign.create({
      name,
      description,
      targetUrl,

      // JWT middleware se logged-in user ki ID lena
      createdBy: req.user.userId,
    });

    // Successful response
    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error("Create Campaign Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET ALL CAMPAIGNS
// ===============================
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Campaigns fetched successfully",
      campaigns,
    });
  } catch (error) {
    console.error("Get Campaigns Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// UPDATE CAMPAIGN
// ===============================
const updateCampaign = async (req, res) => {
  try {
    const { name, description, targetUrl, status } = req.body;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    // Sirf jo fields bheji gayi hain unko update karna
    if (name !== undefined) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (targetUrl !== undefined) campaign.targetUrl = targetUrl;
    if (status !== undefined) campaign.status = status;

    await campaign.save();

    res.status(200).json({
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (error) {
    console.error("Update Campaign Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
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
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    res.status(200).json({
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Delete Campaign Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GENERATE QR CODE
// ===============================
const generateQRCode = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    // QR scan hone par backend ke scan route par jayega
    const scanUrl = `https://smart-qr-marketing-platform.onrender.com/api/scans/${campaign._id}`;

    // Scan URL ka QR code generate karna
    const qrCode = await QRCode.toDataURL(scanUrl);

    // QR code ko campaign me save karna
    campaign.qrCode = qrCode;

    await campaign.save();

    res.status(200).json({
      message: "QR code generated successfully",
      qrCode,
    });
  } catch (error) {
    console.error("Generate QR Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  generateQRCode,
};