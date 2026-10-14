"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { API_BASE_URL, apiCall } from "../lib/api";

const MIN_QRS = 1;
const MAX_QRS = 6;

const SIZES = {
  A4: { width: 210, height: 297, label: "A4 (210 × 297 mm)" },
  A5: { width: 148, height: 210, label: "A5 (148 × 210 mm)" },
  "Counter Standee": { width: 200, height: 300, label: "Counter Tent (200 × 300 mm)" },
  "Small Standee": { width: 150, height: 250, label: "Desk Standee (150 × 250 mm)" },
};

const MATERIALS = {
  Acrylic: {
    border: "#b8c9dc",
    shadow: "0 22px 50px rgba(15, 23, 42, 0.22)",
    accentBorder: "rgba(255, 255, 255, 0.6)",
  },
  "Foam Board": {
    border: "#cbd5e1",
    shadow: "0 14px 30px rgba(15, 23, 42, 0.14)",
    accentBorder: "transparent",
  },
  "Brushed Metal": {
    border: "#94a3b8",
    shadow: "0 20px 45px rgba(15, 23, 42, 0.25)",
    accentBorder: "rgba(255, 255, 255, 0.4)",
  },
  "Wooden Base": {
    border: "#cbd5e1",
    shadow: "0 20px 40px rgba(15, 23, 42, 0.18)",
    accentBorder: "transparent",
  },
};

const FONTS = [
  { id: "Inter, sans-serif", name: "Modern Sans (Inter)" },
  { id: "'Playfair Display', Georgia, serif", name: "Luxury Serif" },
  { id: "Impact, 'Arial Black', sans-serif", name: "Bold Impact" },
  { id: "'Courier New', monospace", name: "Tech Monospace" },
];

// Quick theme presets (supporting both vertical and horizontal)
const THEME_PRESETS = [
  {
    name: "Cafe & Dining (Vertical)",
    desc: "2 QRs: Menu & Google Reviews",
    orientation: "vertical",
    size: "A4",
    background: "#fffbf5",
    accentColor: "#d97706",
    textColor: "#1c1917",
    subtextColor: "#78716c",
    cardBg: "#ffffff",
    tagline: "ARTISAN BISTRO & CAFE",
    title: "DIGITAL MENU & REVIEWS",
    subtitle: "Scan with your phone camera • No app download required",
    cta: "SCAN TO VIEW MENU & REVIEW",
    qrs: [
      {
        id: "qr-1",
        sourceType: "custom",
        url: "https://example.com/menu",
        title: "Digital Menu",
        subtitle: "View Food & Drinks",
        badge: "MENU",
      },
      {
        id: "qr-2",
        sourceType: "custom",
        url: "https://g.page/review",
        title: "Google Review",
        subtitle: "Share Your Feedback",
        badge: "5.0 ★",
      },
    ],
  },
  {
    name: "Retail Counter (Horizontal)",
    desc: "Landscape Desk Standee (2 QRs)",
    orientation: "horizontal",
    size: "Counter Standee",
    background: "#f0fdf4",
    accentColor: "#059669",
    textColor: "#064e3b",
    subtextColor: "#047857",
    cardBg: "#ffffff",
    tagline: "FAST CHECKOUT & CONNECT",
    title: "TAP, PAY & FOLLOW US",
    subtitle: "Instant settlement & exclusive subscriber discounts",
    cta: "TOUCHLESS PAYMENT COUNTER",
    qrs: [
      {
        id: "qr-1",
        sourceType: "custom",
        url: "https://example.com/pay",
        title: "Quick Pay",
        subtitle: "UPI / All Cards Accepted",
        badge: "INSTANT",
      },
      {
        id: "qr-2",
        sourceType: "custom",
        url: "https://instagram.com/ourstore",
        title: "Instagram",
        subtitle: "Tag Us for 10% Off",
        badge: "@STORE",
      },
    ],
  },
  {
    name: "Conference & Expo (3 QRs)",
    desc: "3 QRs: Schedule, Wi-Fi, Feedback",
    orientation: "vertical",
    size: "A4",
    background: "#eff6ff",
    accentColor: "#2563eb",
    textColor: "#1e3a8a",
    subtextColor: "#3b82f6",
    cardBg: "#ffffff",
    tagline: "ANNUAL TECH SUMMIT",
    title: "SCAN TO ACCESS EVENT SERVICES",
    subtitle: "All summit links at your fingertips during the conference",
    cta: "SELECT ANY QR CODE WITH YOUR CAMERA",
    qrs: [
      {
        id: "qr-1",
        sourceType: "custom",
        url: "https://example.com/agenda",
        title: "Full Schedule",
        subtitle: "Speaker Keynotes & Timing",
        badge: "AGENDA",
      },
      {
        id: "qr-2",
        sourceType: "custom",
        url: "https://example.com/wifi",
        title: "Guest Wi-Fi",
        subtitle: "Connect Instantly",
        badge: "FREE 5G",
      },
      {
        id: "qr-3",
        sourceType: "custom",
        url: "https://example.com/survey",
        title: "Event Feedback",
        subtitle: "Win Summit Merch",
        badge: "SURVEY",
      },
    ],
  },
  {
    name: "Multi-Service Hub (6 QRs Horizontal)",
    desc: "Max 6 QRs: Landscape 3x2 Grid",
    orientation: "horizontal",
    size: "A4",
    background: "#faf5ff",
    accentColor: "#7c3aed",
    textColor: "#1e1b4b",
    subtextColor: "#6b21a8",
    cardBg: "#ffffff",
    tagline: "ALL-IN-ONE CONNECT HUB",
    title: "SELECT ANY SERVICE TO CONNECT",
    subtitle: "Scan any QR code below using your phone camera",
    cta: "POINT YOUR CAMERA AT ANY CODE",
    qrs: [
      {
        id: "qr-1",
        sourceType: "custom",
        url: "https://example.com/menu",
        title: "Digital Menu",
        subtitle: "Food & Drinks",
        badge: "MENU",
      },
      {
        id: "qr-2",
        sourceType: "custom",
        url: "https://example.com/pay",
        title: "Quick Pay",
        subtitle: "Instant Settlement",
        badge: "PAY",
      },
      {
        id: "qr-3",
        sourceType: "custom",
        url: "https://instagram.com",
        title: "Instagram",
        subtitle: "Follow & Tag Us",
        badge: "SOCIAL",
      },
      {
        id: "qr-4",
        sourceType: "custom",
        url: "https://g.page/review",
        title: "Google Review",
        subtitle: "5-Star Feedback",
        badge: "REVIEW",
      },
      {
        id: "qr-5",
        sourceType: "custom",
        url: "https://example.com/wifi",
        title: "Free Wi-Fi",
        subtitle: "Instant Guest Access",
        badge: "WI-FI",
      },
      {
        id: "qr-6",
        sourceType: "custom",
        url: "https://example.com/support",
        title: "Help & Support",
        subtitle: "WhatsApp Desk",
        badge: "CHAT",
      },
    ],
  },
  {
    name: "Minimalist Solo (Vertical)",
    desc: "Single Hero QR Standee",
    orientation: "vertical",
    size: "A4",
    background: "#ffffff",
    accentColor: "#4f46e5",
    textColor: "#0f172a",
    subtextColor: "#64748b",
    cardBg: "#f8fafc",
    tagline: "EXCLUSIVE VIP PORTAL",
    title: "SCAN TO DISCOVER",
    subtitle: "Unlock special members-only promotions today",
    cta: "SCAN WITH YOUR PHONE CAMERA",
    qrs: [
      {
        id: "qr-1",
        sourceType: "custom",
        url: "https://example.com",
        title: "Official Portal",
        subtitle: "Instant Digital Access",
        badge: "SCAN ME",
      },
    ],
  },
];

export default function QRStandeeDesigner() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Orientation: "vertical" (portrait) or "horizontal" (landscape)
  const [orientation, setOrientation] = useState("vertical");

  // Standee Texts
  const [tagline, setTagline] = useState("THE SMART BRAND");
  const [title, setTitle] = useState("SCAN & CONNECT");
  const [subtitle, setSubtitle] = useState("Point your phone camera at any code to continue");
  const [cta, setCta] = useState("TOUCHLESS EXPERIENCE • POINT CAMERA HERE");
  const [footerText, setFooterText] = useState("Compatible with iPhone & Android camera • No app download required");

  // Logo State
  const [logoImage, setLogoImage] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [showLogo, setShowLogo] = useState(true);
  const [logoSize, setLogoSize] = useState(65);
  const [logoShape, setLogoShape] = useState("circle");
  const [centerLogoOnQRs, setCenterLogoOnQRs] = useState(false);

  // Standee Material & Dimensions
  const [material, setMaterial] = useState("Acrylic");
  const [size, setSize] = useState("A4");
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);
  const [fontFamily, setFontFamily] = useState(FONTS[0].id);

  // Styling & Colors
  const [background, setBackground] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#0f172a");
  const [subtextColor, setSubtextColor] = useState("#64748b");
  const [qrColor, setQrColor] = useState("#0f172a");
  const [cardBackground, setCardBackground] = useState("#ffffff");
  const [cornerRadius, setCornerRadius] = useState(14);

  // Multiple QRs (Min: 1, Max: 6)
  const [qrList, setQrList] = useState([
    {
      id: "qr-1",
      sourceType: "custom",
      campaignId: "",
      trackScans: true,
      url: "https://example.com/menu",
      title: "Digital Menu",
      subtitle: "Browse food & drinks",
      badge: "MENU",
    },
    {
      id: "qr-2",
      sourceType: "custom",
      campaignId: "",
      trackScans: true,
      url: "https://instagram.com",
      title: "Follow Us",
      subtitle: "Instagram @brand",
      badge: "SOCIAL",
    },
  ]);

  // Active accordion tab for QR edit
  const [activeQrIndex, setActiveQrIndex] = useState(0);

  // User's existing campaigns list
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);

  // Load existing campaigns created by user
  useEffect(() => {
    let mounted = true;
    async function loadCampaigns() {
      try {
        setLoadingCampaigns(true);
        const data = await apiCall("/campaigns?limit=100");
        if (mounted && data?.campaigns) {
          setUserCampaigns(data.campaigns);
        }
      } catch (err) {
        // Not logged in or no campaigns yet
      } finally {
        if (mounted) setLoadingCampaigns(false);
      }
    }
    loadCampaigns();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setLogoDataUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        setLogoImage(img);
        setStatus("Logo uploaded successfully!");
      };
      img.onerror = () => {
        setStatus("Error loading logo image.");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoImage(null);
    setLogoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStatus("Logo removed.");
  };

  // Add QR Code (Up to 6)
  const handleAddQr = () => {
    if (qrList.length >= MAX_QRS) {
      setStatus(`Maximum limit of ${MAX_QRS} QR codes reached.`);
      return;
    }

    const nextIdx = qrList.length + 1;
    const newQr = {
      id: `qr-${Date.now()}`,
      sourceType: "custom",
      campaignId: "",
      trackScans: true,
      url: "https://example.com",
      title: `Service #${nextIdx}`,
      subtitle: "Scan to access",
      badge: `QR ${nextIdx}`,
    };

    setQrList((prev) => [...prev, newQr]);
    setActiveQrIndex(qrList.length);
    setStatus(`QR Code added (${nextIdx}/${MAX_QRS})`);
  };

  // Remove QR Code
  const handleRemoveQr = (index) => {
    if (qrList.length <= MIN_QRS) {
      setStatus(`At least ${MIN_QRS} QR code is required on the standee.`);
      return;
    }

    setQrList((prev) => prev.filter((_, i) => i !== index));
    setActiveQrIndex((prev) => Math.max(0, Math.min(prev, qrList.length - 2)));
    setStatus(`QR Code removed (${qrList.length - 1}/${MAX_QRS})`);
  };

  // Update specific QR field
  const handleUpdateQr = (index, field, value) => {
    setQrList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Select an existing campaign for a QR slot
  const handleSelectCampaignForQr = (index, campaignId) => {
    const camp = userCampaigns.find((c) => c._id === campaignId);
    if (!camp) return;

    setQrList((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const trackScans = current.trackScans !== false;

      // Tracking URL for scan analytics vs direct targetUrl
      const trackingUrl = `${API_BASE_URL}/scans/${camp._id}`;
      const finalUrl = trackScans ? trackingUrl : camp.targetUrl;

      updated[index] = {
        ...current,
        sourceType: "campaign",
        campaignId: camp._id,
        url: finalUrl,
        title: camp.name || "Campaign",
        subtitle: camp.description || (camp.targetUrl ? new URL(camp.targetUrl).hostname : "Scan to open"),
        badge: (camp.category || "OFFER").toUpperCase(),
      };
      return updated;
    });

    setStatus(`Linked campaign "${camp.name}" to QR #${index + 1}`);
  };

  // Toggle tracking vs direct URL for a campaign-linked QR
  const handleToggleTrackScans = (index, enabled) => {
    setQrList((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const camp = userCampaigns.find((c) => c._id === current.campaignId);

      let newUrl = current.url;
      if (camp) {
        newUrl = enabled ? `${API_BASE_URL}/scans/${camp._id}` : camp.targetUrl;
      }

      updated[index] = {
        ...current,
        trackScans: enabled,
        url: newUrl,
      };
      return updated;
    });
  };

  // Apply quick theme preset
  const applyPreset = (preset) => {
    if (preset.orientation) setOrientation(preset.orientation);
    if (preset.size) setSize(preset.size);
    setBackground(preset.background);
    setAccentColor(preset.accentColor);
    setTextColor(preset.textColor);
    setSubtextColor(preset.subtextColor);
    setCardBackground(preset.cardBg);
    setTagline(preset.tagline);
    setTitle(preset.title);
    setSubtitle(preset.subtitle);
    setCta(preset.cta);
    setQrList(preset.qrs);
    setActiveQrIndex(0);
    setStatus(`Applied preset: ${preset.name}`);
  };

  // Helper to compute physical dimensions taking orientation into account
  const getPhysicalDims = useCallback(() => {
    let raw =
      size === "Custom"
        ? {
            width: Math.max(100, Math.min(500, Number(customWidth) || 210)),
            height: Math.max(100, Math.min(700, Number(customHeight) || 297)),
          }
        : SIZES[size] || SIZES["A4"];

    if (orientation === "horizontal") {
      return {
        width: Math.max(raw.width, raw.height),
        height: Math.min(raw.width, raw.height),
      };
    } else {
      return {
        width: Math.min(raw.width, raw.height),
        height: Math.max(raw.width, raw.height),
      };
    }
  }, [size, customWidth, customHeight, orientation]);

  // Canvas Drawing Routine
  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const phys = getPhysicalDims();
    const ratio = phys.width / phys.height;

    // Canvas resolution - portrait: 1000px high; landscape: 1200px wide
    let canvasWidth, canvasHeight;
    if (orientation === "horizontal") {
      canvasWidth = 1200;
      canvasHeight = Math.round(canvasWidth / ratio);
    } else {
      canvasHeight = 1000;
      canvasWidth = Math.round(canvasHeight * ratio);
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const w = canvasWidth;
    const h = canvasHeight;
    const unit = Math.min(w, h) / 300;
    const isHorizontal = orientation === "horizontal";

    ctx.clearRect(0, 0, w, h);

    // 1. Standee Background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);

    // Material finish & reflections
    if (material === "Acrylic") {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      grad.addColorStop(0.3, "rgba(224, 242, 254, 0.15)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = Math.max(2, unit * 1.5);
      ctx.strokeRect(4, 4, w - 8, h - 8);

      // Acrylic corner screws
      const screwR = unit * 3.5;
      const screwMargin = unit * 7;
      const screwPositions = [
        [screwMargin, screwMargin],
        [w - screwMargin, screwMargin],
        [screwMargin, h - screwMargin],
        [w - screwMargin, h - screwMargin],
      ];
      screwPositions.forEach(([sx, sy]) => {
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(sx, sy, screwR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#64748b";
        ctx.fillRect(sx - screwR * 0.6, sy - 1, screwR * 1.2, 2);
      });
    } else if (material === "Brushed Metal") {
      ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = Math.max(3, unit * 2);
      ctx.strokeRect(3, 3, w - 6, h - 6);
    } else if (material === "Wooden Base") {
      const baseH = h * (isHorizontal ? 0.07 : 0.06);
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.roundRect(w * 0.08, h - baseH - 4, w * 0.84, baseH, unit * 3);
      ctx.fill();

      ctx.fillStyle = "#92400e";
      ctx.fillRect(w * 0.1, h - baseH - 2, w * 0.8, baseH * 0.3);
    }

    const centerX = w / 2;
    let currentY = h * (isHorizontal ? 0.04 : 0.045);

    // 2. Brand Logo (if provided & enabled)
    if (showLogo && logoImage) {
      const lBase = isHorizontal ? h * 0.14 : w * 0.22;
      const lSize = Math.max(30, (logoSize / 100) * lBase);
      const lx = centerX - lSize / 2;
      const ly = currentY;

      ctx.save();
      if (logoShape === "circle") {
        ctx.beginPath();
        ctx.arc(centerX, ly + lSize / 2, lSize / 2 + unit * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.08)";
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, ly + lSize / 2, lSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImage, lx, ly, lSize, lSize);
      } else if (logoShape === "rounded") {
        ctx.beginPath();
        ctx.roundRect(lx - unit, ly - unit, lSize + unit * 2, lSize + unit * 2, unit * 4);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(lx, ly, lSize, lSize, unit * 3);
        ctx.clip();
        ctx.drawImage(logoImage, lx, ly, lSize, lSize);
      } else {
        ctx.drawImage(logoImage, lx, ly, lSize, lSize);
      }
      ctx.restore();

      currentY += lSize + h * (isHorizontal ? 0.015 : 0.018);
    }

    // 3. Top Tagline Pill
    if (tagline?.trim()) {
      ctx.font = `700 ${Math.max(10, w * (isHorizontal ? 0.018 : 0.027))}px ${fontFamily}`;
      const tagText = tagline.toUpperCase();
      const tagMetrics = ctx.measureText(tagText);
      const tagW = tagMetrics.width + unit * 16;
      const tagH = Math.max(18, w * (isHorizontal ? 0.032 : 0.048));

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(centerX - tagW / 2, currentY, tagW, tagH, tagH / 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tagText, centerX, currentY + tagH / 2);

      currentY += tagH + h * (isHorizontal ? 0.012 : 0.018);
    }

    // 4. Main Headline
    if (title?.trim()) {
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.max(15, w * (isHorizontal ? 0.038 : 0.06))}px ${fontFamily}`;
      ctx.fillText(title, centerX, currentY, w * 0.9);
      currentY += h * (isHorizontal ? 0.042 : 0.042);
    }

    // 5. Subtitle
    if (subtitle?.trim()) {
      ctx.fillStyle = subtextColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${Math.max(10, w * (isHorizontal ? 0.019 : 0.03))}px ${fontFamily}`;
      ctx.fillText(subtitle, centerX, currentY, w * 0.88);
      currentY += h * (isHorizontal ? 0.035 : 0.032);
    }

    // Generate All QR Code Data URLs asynchronously
    const qrImages = await Promise.all(
      qrList.map(async (item) => {
        try {
          const rawUrl = (item.url || "https://example.com").trim();
          const dataUrl = await QRCode.toDataURL(rawUrl, {
            width: 450,
            margin: 1,
            errorCorrectionLevel: "H",
            color: { dark: qrColor, light: "#FFFFFF" },
          });

          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = dataUrl;
          });
        } catch {
          return null;
        }
      })
    );

    // 6. Draw Multiple QR Cards (Supports 1 to 6 QR codes in Vertical & Horizontal)
    const numQrs = qrList.length;
    const bottomReserve = h * (isHorizontal ? 0.15 : 0.14);
    const availableH = h - currentY - bottomReserve;
    const qrSectionY = currentY + h * 0.01;
    const pad = w * 0.055;
    const contentW = w - pad * 2;

    // Helper to draw a single styled QR Card
    const drawQrCard = (cardX, cardY, cardW, cardH, qrImg, item) => {
      ctx.save();
      ctx.fillStyle = cardBackground;
      ctx.shadowColor = "rgba(15, 23, 42, 0.06)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cornerRadius * unit * 0.75);
      ctx.fill();

      ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
      ctx.lineWidth = Math.max(1, unit * 0.8);
      ctx.stroke();
      ctx.restore();

      // Badge at top of card
      let textStartY = cardY + cardH * 0.12;
      if (item.badge?.trim()) {
        ctx.font = `bold ${Math.max(8, cardW * 0.055)}px ${fontFamily}`;
        const bText = item.badge.toUpperCase();
        const bMetrics = ctx.measureText(bText);
        const bW = bMetrics.width + unit * 8;
        const bH = Math.max(13, cardH * 0.08);

        ctx.fillStyle = `${accentColor}18`;
        ctx.beginPath();
        ctx.roundRect(cardX + cardW / 2 - bW / 2, cardY + cardH * 0.04, bW, bH, bH / 2);
        ctx.fill();

        ctx.fillStyle = accentColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bText, cardX + cardW / 2, cardY + cardH * 0.04 + bH / 2);

        textStartY = cardY + cardH * 0.04 + bH + cardH * 0.04;
      }

      // Title & Subtitle
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.max(10, cardW * 0.068)}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.title || "Scan Here", cardX + cardW / 2, textStartY, cardW * 0.9);

      if (item.subtitle?.trim()) {
        ctx.fillStyle = subtextColor;
        ctx.font = `${Math.max(8, cardW * 0.046)}px ${fontFamily}`;
        ctx.fillText(item.subtitle, cardX + cardW / 2, textStartY + cardH * 0.058, cardW * 0.88);
      }

      // QR Code rendering
      const qrYStart = textStartY + cardH * 0.08;
      const maxQrSide = Math.min(cardW * 0.74, cardH - (qrYStart - cardY) - cardH * 0.06);
      const qrSide = Math.max(35, maxQrSide);
      const qx = cardX + cardW / 2 - qrSide / 2;
      const qy = qrYStart + (cardH - (qrYStart - cardY) - qrSide) / 2;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(qx - unit * 2, qy - unit * 2, qrSide + unit * 4, qrSide + unit * 4, unit * 2);
      ctx.fill();

      if (qrImg) {
        ctx.drawImage(qrImg, qx, qy, qrSide, qrSide);

        if (centerLogoOnQRs && logoImage) {
          const cLogoSize = qrSide * 0.22;
          const clx = qx + qrSide / 2 - cLogoSize / 2;
          const cly = qy + qrSide / 2 - cLogoSize / 2;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(qx + qrSide / 2, qy + qrSide / 2, cLogoSize / 2 + unit * 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.beginPath();
          ctx.arc(qx + qrSide / 2, qy + qrSide / 2, cLogoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImage, clx, cly, cLogoSize, cLogoSize);
          ctx.restore();
        }
      }
    };

    // Calculate grid card positions for 1 to 6 QR codes
    if (isHorizontal) {
      // LANDSCAPE ORIENTATIONS
      if (numQrs === 1) {
        const cardW = Math.min(contentW * 0.45, 420);
        const cardH = availableH * 0.9;
        drawQrCard(centerX - cardW / 2, qrSectionY, cardW, cardH, qrImages[0], qrList[0]);
      } else if (numQrs === 2) {
        const gap = w * 0.03;
        const cardW = (contentW - gap) / 2;
        const cardH = availableH * 0.88;
        drawQrCard(pad, qrSectionY, cardW, cardH, qrImages[0], qrList[0]);
        drawQrCard(pad + cardW + gap, qrSectionY, cardW, cardH, qrImages[1], qrList[1]);
      } else if (numQrs === 3) {
        const gap = w * 0.025;
        const cardW = (contentW - gap * 2) / 3;
        const cardH = availableH * 0.88;
        for (let i = 0; i < 3; i++) {
          drawQrCard(pad + i * (cardW + gap), qrSectionY, cardW, cardH, qrImages[i], qrList[i]);
        }
      } else if (numQrs === 4) {
        const gapX = w * 0.02;
        const cardW = (contentW - gapX * 3) / 4;
        const cardH = availableH * 0.88;
        for (let i = 0; i < 4; i++) {
          drawQrCard(pad + i * (cardW + gapX), qrSectionY, cardW, cardH, qrImages[i], qrList[i]);
        }
      } else if (numQrs === 5) {
        // 5 QRs in Landscape: 5 columns
        const gapX = w * 0.018;
        const cardW = (contentW - gapX * 4) / 5;
        const cardH = availableH * 0.88;
        for (let i = 0; i < 5; i++) {
          drawQrCard(pad + i * (cardW + gapX), qrSectionY, cardW, cardH, qrImages[i], qrList[i]);
        }
      } else if (numQrs === 6) {
        // 6 QRs in Landscape: 2 rows of 3 columns
        const gapX = w * 0.025;
        const gapY = h * 0.025;
        const cardW = (contentW - gapX * 2) / 3;
        const cardH = (availableH - gapY) / 2;

        for (let i = 0; i < 6; i++) {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const cx = pad + col * (cardW + gapX);
          const cy = qrSectionY + row * (cardH + gapY);
          drawQrCard(cx, cy, cardW, cardH, qrImages[i], qrList[i]);
        }
      }
    } else {
      // PORTRAIT (VERTICAL) ORIENTATIONS
      if (numQrs === 1) {
        const cardW = Math.min(contentW * 0.82, 420);
        const cardH = availableH * 0.86;
        drawQrCard(centerX - cardW / 2, qrSectionY, cardW, cardH, qrImages[0], qrList[0]);
      } else if (numQrs === 2) {
        const gap = w * 0.035;
        const cardW = (contentW - gap) / 2;
        const cardH = availableH * 0.82;
        drawQrCard(pad, qrSectionY, cardW, cardH, qrImages[0], qrList[0]);
        drawQrCard(pad + cardW + gap, qrSectionY, cardW, cardH, qrImages[1], qrList[1]);
      } else if (numQrs === 3) {
        const topH = availableH * 0.44;
        const botH = availableH * 0.44;
        const gap = w * 0.03;
        const topW = Math.min(contentW * 0.8, 380);

        drawQrCard(centerX - topW / 2, qrSectionY, topW, topH, qrImages[0], qrList[0]);
        const botY = qrSectionY + topH + gap;
        const botW = (contentW - gap) / 2;
        drawQrCard(pad, botY, botW, botH, qrImages[1], qrList[1]);
        drawQrCard(pad + botW + gap, botY, botW, botH, qrImages[2], qrList[2]);
      } else if (numQrs === 4) {
        const gapX = w * 0.03;
        const gapY = h * 0.02;
        const cardW = (contentW - gapX) / 2;
        const cardH = (availableH - gapY) / 2;

        drawQrCard(pad, qrSectionY, cardW, cardH, qrImages[0], qrList[0]);
        drawQrCard(pad + cardW + gapX, qrSectionY, cardW, cardH, qrImages[1], qrList[1]);
        const row2Y = qrSectionY + cardH + gapY;
        drawQrCard(pad, row2Y, cardW, cardH, qrImages[2], qrList[2]);
        drawQrCard(pad + cardW + gapX, row2Y, cardW, cardH, qrImages[3], qrList[3]);
      } else if (numQrs === 5) {
        // 5 QRs in Portrait: 2 Top + 3 Bottom
        const gap = w * 0.025;
        const rowH = (availableH - gap) / 2;

        // Row 1 (2 cards)
        const topW = (contentW - gap) / 2;
        drawQrCard(pad, qrSectionY, topW, rowH, qrImages[0], qrList[0]);
        drawQrCard(pad + topW + gap, qrSectionY, topW, rowH, qrImages[1], qrList[1]);

        // Row 2 (3 cards)
        const botY = qrSectionY + rowH + gap;
        const botW = (contentW - gap * 2) / 3;
        for (let i = 0; i < 3; i++) {
          drawQrCard(pad + i * (botW + gap), botY, botW, rowH, qrImages[2 + i], qrList[2 + i]);
        }
      } else if (numQrs === 6) {
        // 6 QRs in Portrait: 3 rows × 2 columns
        const gapX = w * 0.03;
        const gapY = h * 0.018;
        const cardW = (contentW - gapX) / 2;
        const cardH = (availableH - gapY * 2) / 3;

        for (let i = 0; i < 6; i++) {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const cx = pad + col * (cardW + gapX);
          const cy = qrSectionY + row * (cardH + gapY);
          drawQrCard(cx, cy, cardW, cardH, qrImages[i], qrList[i]);
        }
      }
    }

    // 7. Call To Action Banner (Bottom)
    const ctaY = h * (isHorizontal ? 0.88 : 0.875);
    const ctaW = contentW * (isHorizontal ? 0.82 : 0.88);
    const ctaH = Math.max(26, h * (isHorizontal ? 0.052 : 0.052));

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(centerX - ctaW / 2, ctaY, ctaW, ctaH, ctaH / 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(10, w * (isHorizontal ? 0.018 : 0.03))}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cta, centerX, ctaY + ctaH / 2, ctaW * 0.94);

    // 8. Standee Footer Note
    if (footerText?.trim()) {
      ctx.fillStyle = subtextColor;
      ctx.globalAlpha = 0.75;
      ctx.font = `${Math.max(8, w * (isHorizontal ? 0.014 : 0.023))}px ${fontFamily}`;
      ctx.fillText(footerText, centerX, h * (isHorizontal ? 0.96 : 0.95), w * 0.9);
      ctx.globalAlpha = 1;
    }
  }, [
    getPhysicalDims,
    orientation,
    tagline,
    title,
    subtitle,
    cta,
    footerText,
    showLogo,
    logoImage,
    logoSize,
    logoShape,
    centerLogoOnQRs,
    material,
    fontFamily,
    background,
    accentColor,
    textColor,
    subtextColor,
    qrColor,
    cardBackground,
    cornerRadius,
    qrList,
  ]);

  // Redraw canvas whenever inputs change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        drawCanvas();
      }
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [drawCanvas]);

  // Download high-resolution PNG
  const downloadStandee = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setExporting(true);
      const link = document.createElement("a");
      link.download = `smart-qr-standee-${orientation}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      setStatus("High-resolution standee PNG downloaded!");
    } catch {
      setStatus("Could not download PNG. Please check image permissions.");
    } finally {
      setExporting(false);
    }
  };

  // Copy standee image to clipboard
  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setStatus("Standee image copied to clipboard!");
      });
    } catch {
      setStatus("Copying to clipboard not supported on this browser.");
    }
  };

  const fieldStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color, #cbd5e1)",
    background: "var(--bg-secondary, #ffffff)",
    color: "var(--text-primary, #0f172a)",
    fontSize: "13px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "5px",
    color: "var(--text-primary, #0f172a)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-color, #e2e8f0)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
            Customizable QR Standee Designer
          </h1>
          <p style={{ color: "var(--text-secondary, #64748b)", fontSize: "14px", margin: "4px 0 0" }}>
            Design physical standees in <strong>Vertical</strong> or <strong>Horizontal</strong> orientation with up to <strong>6 QR codes</strong> and direct campaign integration.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={copyToClipboard}
            className="btn btn-secondary"
            style={{
              padding: "9px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📋 Copy Image
          </button>
          <button
            type="button"
            onClick={downloadStandee}
            disabled={exporting}
            className="btn btn-primary"
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              background: accentColor,
              color: "#ffffff",
              border: 0,
            }}
          >
            {exporting ? "Generating..." : "⬇ Download Standee (PNG)"}
          </button>
        </div>
      </div>

      {/* Preset Quick-Select Cards */}
      <div>
        <label style={{ ...labelStyle, fontSize: "13px", marginBottom: "8px" }}>
          ✨ Quick Starter Presets:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-color, #e2e8f0)",
                background: "var(--bg-secondary, #ffffff)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontWeight: "700", fontSize: "13px", color: preset.accentColor }}>
                {preset.name}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary, #64748b)", marginTop: "2px" }}>
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Designer Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(340px, 440px) minmax(0, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Controls Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Section 0: Orientation & Dimensions */}
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--bg-secondary, #ffffff)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>
              Standee Orientation & Size
            </h3>

            <div>
              <label style={labelStyle}>Layout Orientation</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setOrientation("vertical")}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: orientation === "vertical" ? accentColor : "var(--border-color, #cbd5e1)",
                    background: orientation === "vertical" ? `${accentColor}12` : "transparent",
                    color: orientation === "vertical" ? accentColor : "var(--text-primary, #0f172a)",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>📱 Vertical (Portrait)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrientation("horizontal")}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: orientation === "horizontal" ? accentColor : "var(--border-color, #cbd5e1)",
                    background: orientation === "horizontal" ? `${accentColor}12` : "transparent",
                    color: orientation === "horizontal" ? accentColor : "var(--text-primary, #0f172a)",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>💻 Horizontal (Landscape)</span>
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={labelStyle}>Print Size</label>
                <select
                  style={fieldStyle}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  {Object.entries(SIZES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                  <option value="Custom">Custom Size</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Standee Material</label>
                <select
                  style={fieldStyle}
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                >
                  {Object.keys(MATERIALS).map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {size === "Custom" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>Width (mm)</label>
                  <input
                    type="number"
                    min="100"
                    max="600"
                    style={fieldStyle}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Height (mm)</label>
                  <input
                    type="number"
                    min="100"
                    max="700"
                    style={fieldStyle}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Multiple QR Codes Management (Up to 6) */}
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--bg-secondary, #ffffff)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>
                  Standee QR Codes ({qrList.length}/{MAX_QRS})
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-secondary, #64748b)" }}>
                  Supports up to 6 QR codes (Min: {MIN_QRS}, Max: {MAX_QRS})
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddQr}
                disabled={qrList.length >= MAX_QRS}
                style={{
                  padding: "6px 12px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: qrList.length >= MAX_QRS ? "not-allowed" : "pointer",
                  background: qrList.length >= MAX_QRS ? "#e2e8f0" : accentColor,
                  color: qrList.length >= MAX_QRS ? "#94a3b8" : "#ffffff",
                  border: 0,
                }}
              >
                + Add QR Code
              </button>
            </div>

            {/* QR Tabs / List */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
              {qrList.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveQrIndex(idx)}
                  style={{
                    padding: "6px 11px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: activeQrIndex === idx ? accentColor : "var(--border-color, #cbd5e1)",
                    background: activeQrIndex === idx ? `${accentColor}15` : "transparent",
                    color: activeQrIndex === idx ? accentColor : "var(--text-primary, #0f172a)",
                  }}
                >
                  #{idx + 1}: {item.title || "Untitled"}
                </button>
              ))}
            </div>

            {/* Active QR Code Settings Card */}
            {qrList[activeQrIndex] && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "var(--bg-tertiary, #f8fafc)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px" }}>
                    Configure QR #{activeQrIndex + 1}
                  </span>
                  {qrList.length > MIN_QRS && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQr(activeQrIndex)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        color: "#ef4444",
                        background: "#fee2e2",
                        border: 0,
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Delete QR
                    </button>
                  )}
                </div>

                {/* Option for choosing Existing Campaigns created by user */}
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "var(--bg-secondary, #ffffff)",
                    border: "1px solid var(--border-color, #e2e8f0)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ ...labelStyle, margin: 0, color: accentColor }}>
                      🎯 Link Existing User Campaign
                    </label>
                    <Link
                      href="/campaigns"
                      target="_blank"
                      style={{ fontSize: "11px", color: accentColor, textDecoration: "underline" }}
                    >
                      Manage Campaigns ↗
                    </Link>
                  </div>

                  {loadingCampaigns ? (
                    <div style={{ fontSize: "12px", color: "var(--text-secondary, #64748b)" }}>
                      Loading your campaigns...
                    </div>
                  ) : userCampaigns.length > 0 ? (
                    <select
                      style={{ ...fieldStyle, background: "#f8fafc" }}
                      value={qrList[activeQrIndex].campaignId || ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSelectCampaignForQr(activeQrIndex, e.target.value);
                        } else {
                          handleUpdateQr(activeQrIndex, "campaignId", "");
                          handleUpdateQr(activeQrIndex, "sourceType", "custom");
                        }
                      }}
                    >
                      <option value="">-- Choose from your created campaigns --</option>
                      {userCampaigns.map((camp) => (
                        <option key={camp._id} value={camp._id}>
                          {camp.name} ({camp.category || "General"}) · {camp.scanCount || 0} scans
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: "12px", color: "var(--text-secondary, #64748b)", lineHeight: "1.5" }}>
                      No saved campaigns found yet. Create one in the{" "}
                      <Link href="/campaigns" style={{ color: accentColor, fontWeight: "600" }}>
                        Campaigns
                      </Link>{" "}
                      tab or enter a custom destination URL below.
                    </div>
                  )}

                  {/* Tracking vs Direct URL option when campaign is linked */}
                  {qrList[activeQrIndex].campaignId && (
                    <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border-color, #e2e8f0)" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={qrList[activeQrIndex].trackScans !== false}
                          onChange={(e) => handleToggleTrackScans(activeQrIndex, e.target.checked)}
                        />
                        <span>Track physical scans in Smart QR Analytics</span>
                      </label>
                      <div style={{ fontSize: "11px", color: "#166534", marginTop: "3px" }}>
                        ✓ Scans on this standee will count toward this campaign's analytics.
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>
                    Destination URL {qrList[activeQrIndex].campaignId && <span style={{ color: accentColor }}>(Auto-filled from campaign)</span>}
                  </label>
                  <input
                    style={fieldStyle}
                    value={qrList[activeQrIndex].url}
                    onChange={(e) => handleUpdateQr(activeQrIndex, "url", e.target.value)}
                    placeholder="https://example.com/target"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>Card Title</label>
                    <input
                      style={fieldStyle}
                      value={qrList[activeQrIndex].title}
                      onChange={(e) => handleUpdateQr(activeQrIndex, "title", e.target.value)}
                      placeholder="e.g. Digital Menu"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Badge Tag</label>
                    <input
                      style={fieldStyle}
                      value={qrList[activeQrIndex].badge}
                      onChange={(e) => handleUpdateQr(activeQrIndex, "badge", e.target.value)}
                      placeholder="e.g. MENU, FREE, PAY"
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Subtitle / Description</label>
                  <input
                    style={fieldStyle}
                    value={qrList[activeQrIndex].subtitle}
                    onChange={(e) => handleUpdateQr(activeQrIndex, "subtitle", e.target.value)}
                    placeholder="e.g. View drinks & appetizers"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Logo Configuration */}
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--bg-secondary, #ffffff)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>
                Brand Logo & Badges
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                />
                Show Logo
              </label>
            </div>

            {showLogo && (
              <>
                <div>
                  <label style={labelStyle}>Upload Brand Logo</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ fontSize: "12px" }}
                  />
                  {logoDataUrl && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                      <img
                        src={logoDataUrl}
                        alt="Logo preview"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: logoShape === "circle" ? "50%" : "6px",
                          objectFit: "contain",
                          border: "1px solid var(--border-color, #cbd5e1)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "5px",
                          fontSize: "11px",
                          color: "#ef4444",
                          background: "#fee2e2",
                          border: 0,
                          cursor: "pointer",
                        }}
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>Logo Shape</label>
                    <select
                      style={fieldStyle}
                      value={logoShape}
                      onChange={(e) => setLogoShape(e.target.value)}
                    >
                      <option value="circle">Circular Badge</option>
                      <option value="rounded">Rounded Square</option>
                      <option value="square">Original Square</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Size: {logoSize}px</label>
                    <input
                      type="range"
                      min="35"
                      max="110"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      style={{ width: "100%", marginTop: "8px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={centerLogoOnQRs}
                      onChange={(e) => setCenterLogoOnQRs(e.target.checked)}
                    />
                    <span>Also place mini brand icon in the center of QR codes</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Section 3: Customizable Standee Text */}
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--bg-secondary, #ffffff)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>
              Customizable Template Text
            </h3>

            <div>
              <label style={labelStyle}>Top Brand Tagline</label>
              <input
                style={fieldStyle}
                value={tagline}
                maxLength={45}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. THE ARTISAN BISTRO"
              />
            </div>

            <div>
              <label style={labelStyle}>Main Headline</label>
              <input
                style={fieldStyle}
                value={title}
                maxLength={50}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SCAN TO CONNECT & ORDER"
              />
            </div>

            <div>
              <label style={labelStyle}>Subtitle / Prompt</label>
              <input
                style={fieldStyle}
                value={subtitle}
                maxLength={70}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Point your camera • Instant digital access"
              />
            </div>

            <div>
              <label style={labelStyle}>Bottom CTA Banner Text</label>
              <input
                style={fieldStyle}
                value={cta}
                maxLength={60}
                onChange={(e) => setCta(e.target.value)}
                placeholder="e.g. TOUCHLESS EXPERIENCE • POINT CAMERA"
              />
            </div>

            <div>
              <label style={labelStyle}>Footer Notice</label>
              <input
                style={fieldStyle}
                value={footerText}
                maxLength={90}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="e.g. Compatible with all camera phones"
              />
            </div>
          </div>

          {/* Section 4: Typography & Colors */}
          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--bg-secondary, #ffffff)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>
              Typography & Color Theme
            </h3>

            <div>
              <label style={labelStyle}>Typography Font</label>
              <select
                style={fieldStyle}
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                {FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Pickers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {[
                ["Accent Color", accentColor, setAccentColor],
                ["Standee Background", background, setBackground],
                ["Primary Text", textColor, setTextColor],
                ["QR Modules Color", qrColor, setQrColor],
              ].map(([label, val, setter]) => (
                <div key={label}>
                  <label style={{ ...labelStyle, fontSize: "11px" }}>{label}</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      border: "1px solid var(--border-color, #cbd5e1)",
                      padding: "5px 8px",
                      borderRadius: "7px",
                      background: "var(--bg-secondary, #ffffff)",
                    }}
                  >
                    <input
                      type="color"
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      style={{
                        width: "28px",
                        height: "24px",
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "11px", fontWeight: "600" }}>{val.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Canvas Preview Column */}
        <div
          style={{
            position: "sticky",
            top: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--bg-secondary, #ffffff)",
              boxShadow: "var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.06))",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: accentColor,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Live High-DPI Standee Preview
                </span>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary, #64748b)" }}>
                  {orientation === "horizontal" ? "Horizontal (Landscape)" : "Vertical (Portrait)"} ·{" "}
                  {size === "Custom"
                    ? `${customWidth} × ${customHeight} mm`
                    : SIZES[size]?.label || size}{" "}
                  · {qrList.length} of {MAX_QRS} QR Codes
                </div>
              </div>

              <span
                style={{
                  fontSize: "11px",
                  color: "#166534",
                  background: "#dcfce7",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontWeight: "700",
                }}
              >
                ● Live 1:1 Rendering
              </span>
            </div>

            {/* Canvas Container with Frame Simulation */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "24px 16px",
                background: "radial-gradient(circle, #f1f5f9 0%, #e2e8f0 100%)",
                borderRadius: "12px",
                overflow: "auto",
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: orientation === "horizontal" ? "560px" : "400px",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: MATERIALS[material]?.shadow || "0 15px 35px rgba(0,0,0,0.15)",
                  border: `2px solid ${MATERIALS[material]?.border || "#cbd5e1"}`,
                  background: "#ffffff",
                }}
              />
            </div>

            {/* Status & Tips */}
            {status && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  color: "#1e40af",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {status}
              </div>
            )}

            <div
              style={{
                marginTop: "14px",
                fontSize: "11px",
                color: "var(--text-secondary, #64748b)",
                lineHeight: "1.6",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div>💡 <strong>Orientation:</strong> Toggle between Vertical (table tents, entrance displays) and Horizontal (checkout counters, reception desks).</div>
              <div>🎯 <strong>Campaign Linking:</strong> Linked campaigns automatically direct scanners through the tracking route, recording analytics in your dashboard.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
