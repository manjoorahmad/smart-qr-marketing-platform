
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const SIZES = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  "Small Standee": { width: 150, height: 250 },
  "Counter Standee": { width: 200, height: 300 },
};

const MATERIALS = {
  Acrylic: { border: "#b8c9dc", shadow: "0 18px 40px #0f172a25" },
  "Foam Board": { border: "#e2e8f0", shadow: "0 12px 25px #0f172a18" },
  PVC: { border: "#cbd5e1", shadow: "0 14px 30px #0f172a20" },
};

export default function QRStandeeDesigner() {
  const canvasRef = useRef(null);
  const qrImageRef = useRef(null);

  const [campaignUrl, setCampaignUrl] = useState("https://example.com");
  const [title, setTitle] = useState("SCAN & DISCOVER");
  const [subtitle, setSubtitle] = useState("Explore our latest offers");
  const [cta, setCta] = useState("SCAN ME");
  const [material, setMaterial] = useState("Acrylic");
  const [size, setSize] = useState("A4");
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);
  const [background, setBackground] = useState("#ffffff");
  const [qrColor, setQrColor] = useState("#111827");
  const [textColor, setTextColor] = useState("#111827");
  const [accentColor, setAccentColor] = useState("#6d5dfb");
  const [qrSize, setQrSize] = useState(160);
  const [cornerRadius, setCornerRadius] = useState(18);
  const [status, setStatus] = useState("");

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dims =
      size === "Custom"
        ? {
            width: Math.max(100, Math.min(500, Number(customWidth) || 210)),
            height: Math.max(100, Math.min(700, Number(customHeight) || 297)),
          }
        : SIZES[size];

    // Use a portrait preview while retaining the chosen physical proportions.
    const ratio = dims.width / dims.height;
    const canvasHeight = 900;
    const canvasWidth = Math.round(canvasHeight * ratio);
    const scale = canvasHeight / dims.height;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const w = canvasWidth;
    const h = canvasHeight;
    const unit = Math.min(w, h) / 300;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);

    // Simulated material finish
    if (material === "Acrylic") {
      ctx.fillStyle = "rgba(180, 210, 240, 0.13)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = Math.max(2, unit * 1.4);
      ctx.strokeRect(2, 2, w - 4, h - 4);
    } else if (material === "Foam Board") {
      ctx.fillStyle = "rgba(148,163,184,0.04)";
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = "rgba(100,116,139,0.06)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, 0, w, h * 0.025);
    }

    const centerX = w / 2;
    const pad = w * 0.09;
    const top = h * 0.09;

    // Accent header
    ctx.fillStyle = accentColor;
    const headerH = h * 0.018;
    ctx.beginPath();
    ctx.roundRect(pad, top, w - pad * 2, headerH, headerH / 2);
    ctx.fill();

    // Main title
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${Math.max(14, w * 0.065)}px Arial`;
    ctx.fillText(title.slice(0, 40), centerX, h * 0.18, w - pad * 2);

    // Subtitle
    ctx.font = `${Math.max(10, w * 0.034)}px Arial`;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.78;
    ctx.fillText(subtitle.slice(0, 65), centerX, h * 0.235, w - pad * 2);
    ctx.globalAlpha = 1;

    // QR image, generated from the entered destination URL.
    const qrCanvasSize = Math.min(w * 0.65, h * 0.42, qrSize * scale * 1.2);
    const qrX = centerX - qrCanvasSize / 2;
    const qrY = h * 0.31;

    if (qrImageRef.current) {
      const qrImage = qrImageRef.current;
      const qrPad = qrCanvasSize * 0.08;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(
        qrX - qrPad,
        qrY - qrPad,
        qrCanvasSize + qrPad * 2,
        qrCanvasSize + qrPad * 2,
        cornerRadius * unit
      );
      ctx.fill();

      ctx.drawImage(qrImage, qrX, qrY, qrCanvasSize, qrCanvasSize);
    }

    // Call to action
    const ctaY = Math.min(h * 0.81, qrY + qrCanvasSize + h * 0.09);
    const ctaW = w * 0.64;
    const ctaH = h * 0.07;

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(
      centerX - ctaW / 2,
      ctaY,
      ctaW,
      ctaH,
      Math.min(18 * unit, ctaH / 3)
    );
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(12, w * 0.04)}px Arial`;
    ctx.fillText(cta.slice(0, 24), centerX, ctaY + ctaH / 2, ctaW - 12);

    // Footer
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.6;
    ctx.font = `${Math.max(9, w * 0.025)}px Arial`;
    ctx.fillText("Scan with your phone camera", centerX, h * 0.94);
    ctx.globalAlpha = 1;
  }, [
    campaignUrl, title, subtitle, cta, material, size, customWidth,
    customHeight, background, qrColor, textColor, accentColor, qrSize,
    cornerRadius,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function generateQR() {
      try {
        if (!campaignUrl.trim()) {
          qrImageRef.current = null;
          await drawCanvas();
          setStatus("Enter a destination URL.");
          return;
        }

        const dataUrl = await QRCode.toDataURL(campaignUrl.trim(), {
          width: 600,
          margin: 2,
          errorCorrectionLevel: "H",
          color: {
            dark: qrColor,
            light: "#FFFFFF",
          },
        });

        const image = new Image();
        image.onload = async () => {
          if (cancelled) return;
          qrImageRef.current = image;
          await drawCanvas();
          setStatus("");
        };
        image.onerror = () => {
          if (!cancelled) setStatus("Could not load the QR preview.");
        };
        image.src = dataUrl;
      } catch {
        if (!cancelled) setStatus("Enter a valid URL to generate a QR code.");
      }
    }

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [campaignUrl, qrColor, drawCanvas]);

  const downloadDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "qr-standee-design.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setStatus("Design downloaded as PNG.");
  };

  const resetDesign = () => {
    setTitle("SCAN & DISCOVER");
    setSubtitle("Explore our latest offers");
    setCta("SCAN ME");
    setMaterial("Acrylic");
    setSize("A4");
    setCustomWidth(210);
    setCustomHeight(297);
    setBackground("#ffffff");
    setQrColor("#111827");
    setTextColor("#111827");
    setAccentColor("#6d5dfb");
    setQrSize(160);
    setCornerRadius(18);
    setStatus("");
  };

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "650",
    marginBottom: "7px",
    color: "var(--text-primary, #111827)",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(260px, 340px) minmax(0, 1fr)",
        gap: "24px",
        alignItems: "start",
      }}
    >
      {/* Customization panel */}
      <section
        style={{
          padding: "22px",
          borderRadius: "16px",
          border: "1px solid var(--border-color, #e2e8f0)",
          background: "var(--bg-card, #ffffff)",
        }}
      >
        <h2 style={{ fontSize: "19px", margin: "0 0 5px" }}>
          Customize your standee
        </h2>
        <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 22px" }}>
          Changes appear in the preview.
        </p>

        <div style={{ display: "grid", gap: "17px" }}>
          <div>
            <label style={labelStyle}>Campaign URL</label>
            <input
              style={fieldStyle}
              value={campaignUrl}
              onChange={(e) => setCampaignUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Standee material</label>
            <select
              style={fieldStyle}
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              {Object.keys(MATERIALS).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "6px 0 0" }}>
              Material changes the preview finish, not the physical product.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Standee size</label>
            <select
              style={fieldStyle}
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {Object.keys(SIZES).map((item) => (
                <option key={item}>{item}</option>
              ))}
              <option value="Custom">Custom size</option>
            </select>
          </div>

          {size === "Custom" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Width (mm)</label>
                <input
                  type="number"
                  min="100"
                  max="500"
                  style={fieldStyle}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
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

          <div>
            <label style={labelStyle}>Heading</label>
            <input
              style={fieldStyle}
              value={title}
              maxLength={40}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Subtitle</label>
            <input
              style={fieldStyle}
              value={subtitle}
              maxLength={65}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Button text</label>
            <input
              style={fieldStyle}
              value={cta}
              maxLength={24}
              onChange={(e) => setCta(e.target.value)}
            />
          </div>

          {[
            ["Background color", background, setBackground],
            ["QR code color", qrColor, setQrColor],
            ["Text color", textColor, setTextColor],
            ["Accent color", accentColor, setAccentColor],
          ].map(([label, value, setter]) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid #dbe2ea",
                  padding: "6px 10px",
                  borderRadius: "9px",
                }}
              >
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  aria-label={label}
                  style={{
                    width: "35px",
                    height: "30px",
                    border: 0,
                    padding: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: "13px" }}>{value.toUpperCase()}</span>
              </div>
            </div>
          ))}

          <div>
            <label style={labelStyle}>QR display size: {qrSize}px</label>
            <input
              type="range"
              min="100"
              max="240"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={labelStyle}>QR corner radius: {cornerRadius}px</label>
            <input
              type="range"
              min="0"
              max="30"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <button
            type="button"
            onClick={downloadDesign}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "10px",
              border: 0,
              color: "#ffffff",
              background: "#6d5dfb",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Download Standee PNG
          </button>

          <button
            type="button"
            onClick={resetDesign}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "10px",
              border: "1px solid #dbe2ea",
              color: "#334155",
              background: "#ffffff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Reset design
          </button>

          {status && (
            <p role="status" style={{ fontSize: "13px", color: "#64748b" }}>
              {status}
            </p>
          )}
        </div>
      </section>

      {/* Canvas preview */}
      <section
        style={{
          minWidth: 0,
          padding: "22px",
          borderRadius: "16px",
          border: "1px solid var(--border-color, #e2e8f0)",
          background: "var(--bg-card, #ffffff)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "19px" }}>Live canvas</h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "5px 0 0" }}>
              {size === "Custom"
                ? `${customWidth} × ${customHeight} mm`
                : `${size} · ${SIZES[size].width} × ${SIZES[size].height} mm`}
              {" · "}
              {material}
            </p>
          </div>
          <span
            style={{
              fontSize: "12px",
              color: "#15803d",
              background: "#dcfce7",
              padding: "7px 10px",
              borderRadius: "8px",
              fontWeight: "650",
            }}
          >
            Live preview
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "24px",
            background: "#f1f5f9",
            borderRadius: "14px",
            overflow: "auto",
          }}
        >
          <canvas
            ref={canvasRef}
            aria-label="Custom QR standee canvas preview"
            style={{
              display: "block",
              width: "100%",
              maxWidth: "420px",
              height: "auto",
              borderRadius: "3px",
              boxShadow: MATERIALS[material].shadow,
              border: `1px solid ${MATERIALS[material].border}`,
              background: "#ffffff",
            }}
          />
        </div>

        <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.7 }}>
          Export is a PNG image. For professional printing, confirm the final
          physical dimensions and scan-test the exported QR code before
          printing.
        </p>
      </section>
    </div>
  );
}
