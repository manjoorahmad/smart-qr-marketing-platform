const Scan = require("../models/Scan");
const Campaign = require("../models/Campaign");

// Helper function: Render a clean, professional status page
const renderStatusPage = ({ title, badgeText, badgeColor, icon, message, detailText, campaignName }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Smart QR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      border-radius: 20px;
      padding: 40px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: ${badgeColor}22;
      border: 2px solid ${badgeColor}66;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      margin: 0 auto 20px;
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: ${badgeColor}33;
      color: ${badgeColor};
      border: 1px solid ${badgeColor}55;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .campaign-name {
      font-size: 15px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 16px;
      word-break: break-word;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .detail-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 14px;
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 28px;
    }
    .brand {
      font-size: 12px;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .brand strong {
      color: #818cf8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">${icon}</div>
    <span class="badge">${badgeText}</span>
    <h1>${title}</h1>
    <p class="campaign-name">${campaignName || "Campaign"}</p>
    <p class="message">${message}</p>
    ${detailText ? `<div class="detail-box">${detailText}</div>` : ""}
    <div class="brand">
      Powered by <strong>Smart QR Marketing</strong>
    </div>
  </div>
</body>
</html>`;
};

// ===============================
// TRACK QR SCAN (DYNAMIC REDIRECT & SCHEDULING)
// ===============================
const trackScan = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).send(renderStatusPage({
        title: "Campaign Not Found",
        badgeText: "404 Not Found",
        badgeColor: "#ef4444",
        icon: "🔍",
        message: "The QR code you scanned does not correspond to an existing campaign.",
        detailText: "Please contact the campaign owner or administrator.",
        campaignName: "Unknown Campaign",
      }));
    }

    // Capture requester details
    const userAgent = req.headers["user-agent"] || "Unknown";
    const referrer = req.get("referer") || req.get("referrer") || "Direct";
    const ip = req.ip || req.headers["x-forwarded-for"] || "";

    // Device detection
    let device = "Desktop";
    if (/mobile/i.test(userAgent)) {
      device = "Mobile";
    } else if (/tablet/i.test(userAgent)) {
      device = "Tablet";
    }

    // Browser detection
    let browser = "Unknown";
    if (/edg/i.test(userAgent)) {
      browser = "Edge";
    } else if (/chrome/i.test(userAgent)) {
      browser = "Chrome";
    } else if (/firefox/i.test(userAgent)) {
      browser = "Firefox";
    } else if (/safari/i.test(userAgent)) {
      browser = "Safari";
    } else if (/opera|opr/i.test(userAgent)) {
      browser = "Opera";
    }

    // Evaluate real-time effective status
    const effectiveStatus = campaign.getEffectiveStatus();

    // 1. CAMPAIGN EXPIRED: Prevent redirect & show branded Expired page
    if (effectiveStatus === "expired") {
      await Scan.create({
        campaign: campaign._id,
        device,
        browser,
        referrer,
        ip,
        status: "expired",
      });

      campaign.expiredScanCount = (campaign.expiredScanCount || 0) + 1;
      await campaign.save();

      const expiryDateStr = campaign.endDate
        ? new Date(campaign.endDate).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "Past date";

      return res.status(200).send(renderStatusPage({
        title: "Campaign Expired",
        badgeText: "Campaign Expired",
        badgeColor: "#ef4444",
        icon: "⏰",
        message: "This promotional QR campaign has ended and is no longer accepting visits.",
        detailText: `📅 Expired on: <strong>${expiryDateStr}</strong>`,
        campaignName: campaign.name,
      }));
    }

    // 2. CAMPAIGN SCHEDULED: Prevent redirect & show Scheduled page
    if (effectiveStatus === "scheduled") {
      await Scan.create({
        campaign: campaign._id,
        device,
        browser,
        referrer,
        ip,
        status: "scheduled",
      });

      const startDateStr = campaign.startDate
        ? new Date(campaign.startDate).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "Future date";

      return res.status(200).send(renderStatusPage({
        title: "Campaign Not Active Yet",
        badgeText: "Scheduled",
        badgeColor: "#6366f1",
        icon: "⏳",
        message: "This campaign is scheduled to launch soon. Please check back later!",
        detailText: `🚀 Starts on: <strong>${startDateStr}</strong>`,
        campaignName: campaign.name,
      }));
    }

    // 3. CAMPAIGN INACTIVE: Paused by owner
    if (effectiveStatus === "inactive") {
      await Scan.create({
        campaign: campaign._id,
        device,
        browser,
        referrer,
        ip,
        status: "inactive",
      });

      return res.status(200).send(renderStatusPage({
        title: "Campaign Inactive",
        badgeText: "Paused",
        badgeColor: "#94a3b8",
        icon: "⏸️",
        message: "This QR campaign is currently paused by its owner.",
        detailText: "Please check back later or contact the campaign administrator.",
        campaignName: campaign.name,
      }));
    }

    // 4. CAMPAIGN ACTIVE: Record valid scan and dynamically redirect to current destination URL
    await Scan.create({
      campaign: campaign._id,
      device,
      browser,
      referrer,
      ip,
      status: "success",
    });

    campaign.scanCount += 1;
    await campaign.save();

    // Dynamic redirect to current destination URL!
    return res.redirect(campaign.targetUrl);
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