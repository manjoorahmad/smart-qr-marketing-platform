"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiCall } from "../lib/api";
import { useToast } from "../context/ToastContext";

// API Base URL for scan tracking
const SCAN_BASE_URL = "https://smart-qr-marketing-platform.onrender.com/api/scans";

// --- Icons ---
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const QRIcon2 = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
    <rect x="3" y="16" width="5" height="5" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" />
    <path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Predefined Campaign Categories
const CAMPAIGN_CATEGORIES = [
  "General",
  "Marketing",
  "Retail",
  "Social Media",
  "Events",
  "Product",
  "Personal",
  "Other",
];

// Campaign card skeleton
function CampaignCardSkeleton() {
  return (
    <div className="campaign-card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <div className="skeleton" style={{ width: "60%", height: "18px" }} />
        <div className="skeleton" style={{ width: "60px", height: "22px", borderRadius: "20px" }} />
      </div>
      <div className="skeleton" style={{ width: "90%", height: "13px", marginBottom: "8px" }} />
      <div className="skeleton" style={{ width: "50%", height: "13px", marginBottom: "20px" }} />
      <div style={{ display: "flex", gap: "8px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ width: "70px", height: "32px", borderRadius: "6px" }} />
        ))}
      </div>
    </div>
  );
}

export default function Campaigns() {
  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCampaign, setQrCampaign] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const toast = useToast();

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    campaignId: null,
    campaignName: "",
  });

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [category, setCategory] = useState("General");

  // Edit form state
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editCategory, setEditCategory] = useState("General");

  // QR customization
  const [qrDarkColor, setQrDarkColor] = useState("#000000");
  const [qrLightColor, setQrLightColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(300);
  const [copiedId, setCopiedId] = useState(null);

  // Login check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.replace("/login");
  }, []);

  // Fetch campaigns (with all filters)
  const fetchCampaigns = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: sortBy,
        page,
        limit: 9,
      });
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const data = await apiCall(`/campaigns?${params.toString()}`);
      setCampaigns(data.campaigns || []);
      setPagination(data.pagination || null);
    } catch (err) {
      toast.error("Failed to load campaigns", err.message);
    } finally {
      setLoading(false);
    }
  }, [sortBy, searchTerm, statusFilter, categoryFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchCampaigns(1);
    setCurrentPage(1);
  }, [sortBy, statusFilter, categoryFilter, startDate, endDate]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns(1);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // CREATE CAMPAIGN
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await apiCall("/campaigns", {
        method: "POST",
        body: JSON.stringify({ name, description, targetUrl, category }),
      });
      toast.success("Campaign Created!", `"${name}" has been created successfully.`);
      setName("");
      setDescription("");
      setTargetUrl("");
      setCategory("General");
      setShowCreateForm(false);
      fetchCampaigns(1);
    } catch (err) {
      toast.error("Failed to create campaign", err.message);
    } finally {
      setCreating(false);
    }
  };

  // EDIT CAMPAIGN - open form
  const handleEditCampaign = (campaign) => {
    setEditId(campaign._id);
    setEditName(campaign.name);
    setEditDescription(campaign.description || "");
    setEditTargetUrl(campaign.targetUrl);
    setEditStatus(campaign.status || "active");
    setEditCategory(campaign.category || "General");
    setShowEditForm(true);
    setShowCreateForm(false);
    setSelectedCampaign(null);
    setShowDetailsModal(false);
  };

  // UPDATE CAMPAIGN
  const handleUpdateCampaign = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await apiCall(`/campaigns/${editId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          targetUrl: editTargetUrl,
          status: editStatus,
          category: editCategory,
        }),
      });
      toast.success("Campaign Updated!", "Your campaign has been updated.");
      setShowEditForm(false);
      fetchCampaigns(currentPage);
    } catch (err) {
      toast.error("Update failed", err.message);
    } finally {
      setUpdating(false);
    }
  };

  // DELETE CAMPAIGN - show confirm dialog
  const handleDeleteClick = (campaign) => {
    setConfirmDialog({
      isOpen: true,
      campaignId: campaign._id,
      campaignName: campaign.name,
    });
  };

  // DELETE CAMPAIGN - confirmed
  const handleDeleteConfirm = async () => {
    const { campaignId, campaignName } = confirmDialog;
    setConfirmDialog({ isOpen: false, campaignId: null, campaignName: "" });
    try {
      await apiCall(`/campaigns/${campaignId}`, { method: "DELETE" });
      toast.success("Campaign Deleted", `"${campaignName}" has been removed.`);
      fetchCampaigns(currentPage);
    } catch (err) {
      toast.error("Delete failed", err.message);
    }
  };

  // GENERATE QR CODE
  const handleGenerateQR = async (campaign) => {
    setQrCampaign(campaign);
    setShowQRModal(true);
  };

  const handleSubmitQR = async () => {
    if (!qrCampaign) return;
    try {
      setGeneratingQR(true);
      const data = await apiCall(`/campaigns/${qrCampaign._id}/qr`, {
        method: "POST",
        body: JSON.stringify({
          darkColor: qrDarkColor,
          lightColor: qrLightColor,
          size: qrSize,
        }),
      });
      toast.success("QR Code Generated!", "Your QR code is ready to download.");
      fetchCampaigns(currentPage);
      setShowQRModal(false);
    } catch (err) {
      toast.error("QR generation failed", err.message);
    } finally {
      setGeneratingQR(false);
    }
  };

  // COPY SCAN LINK
  const handleCopyLink = async (campaignId) => {
    const scanUrl = `${SCAN_BASE_URL}/${campaignId}`;
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopiedId(campaignId);
      toast.info("Link Copied!", "Scan URL copied to clipboard.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Copy failed", "Could not copy to clipboard.");
    }
  };

  // DOWNLOAD QR
  const handleDownloadQR = (campaign) => {
    if (!campaign.qrCode) {
      toast.warning("No QR Code", "Please generate a QR code first.");
      return;
    }
    const link = document.createElement("a");
    link.href = campaign.qrCode;
    link.download = `${campaign.name.replace(/\s+/g, "-")}-QR.png`;
    link.click();
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCampaigns(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <DashboardLayout>
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Campaign?"
        message={`Are you sure you want to delete "${confirmDialog.campaignName}"? This will also remove all scan data. This action cannot be undone.`}
        confirmText="Delete Campaign"
        cancelText="Keep It"
        confirmStyle="danger"
        icon="🗑️"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, campaignId: null, campaignName: "" })}
      />

      {/* Campaign Details Modal */}
      {showDetailsModal && selectedCampaign && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Campaign Details</h2>
              <button
                className="btn-icon"
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Campaign Name</p>
                <p style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>{selectedCampaign.name}</p>
              </div>

              {selectedCampaign.description && (
                <div>
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Description</p>
                  <p style={{ color: "var(--text-secondary)" }}>{selectedCampaign.description}</p>
                </div>
              )}

              <div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Target URL</p>
                <a href={selectedCampaign.targetUrl} target="_blank" rel="noreferrer"
                  style={{ color: "var(--color-primary)", wordBreak: "break-all", fontSize: "14px" }}>
                  {selectedCampaign.targetUrl}
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "12px" }}>
                <div style={{ background: "var(--bg-primary)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "4px" }}>STATUS</p>
                  <span className={`badge ${selectedCampaign.status === "active" ? "badge-active" : "badge-inactive"}`}>
                    {selectedCampaign.status}
                  </span>
                </div>
                <div style={{ background: "var(--bg-primary)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "4px" }}>CATEGORY</p>
                  <span className="badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                    {selectedCampaign.category || "General"}
                  </span>
                </div>
                <div style={{ background: "var(--bg-primary)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "4px" }}>TOTAL SCANS</p>
                  <p style={{ fontWeight: 800, fontSize: "20px", color: "var(--color-primary)" }}>{selectedCampaign.scanCount || 0}</p>
                </div>
                <div style={{ background: "var(--bg-primary)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "4px" }}>CREATED</p>
                  <p style={{ fontWeight: 600, fontSize: "12px", color: "var(--text-secondary)" }}>
                    {new Date(selectedCampaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* QR Code preview */}
              {selectedCampaign.qrCode && (
                <div className="qr-preview-container">
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>QR Code</p>
                  <img src={selectedCampaign.qrCode} alt="QR Code" className="qr-preview-image" />
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownloadQR(selectedCampaign)}
                    >
                      <DownloadIcon /> Download PNG
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleCopyLink(selectedCampaign._id)}
                    >
                      <CopyIcon /> {copiedId === selectedCampaign._id ? "Copied!" : "Copy Scan URL"}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => { setShowDetailsModal(false); handleEditCampaign(selectedCampaign); }}
                >
                  Edit Campaign
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Customization Modal */}
      {showQRModal && qrCampaign && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🎨 Generate QR Code</h2>
              <button className="btn-icon" onClick={() => setShowQRModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Customize the QR code for <strong style={{ color: "var(--text-primary)" }}>{qrCampaign.name}</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div className="form-group">
                <label className="form-label">QR Color (Dark)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="color-swatch">
                    <input type="color" value={qrDarkColor} onChange={(e) => setQrDarkColor(e.target.value)} id="qr-dark-color" />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={qrDarkColor}
                    onChange={(e) => setQrDarkColor(e.target.value)}
                    placeholder="#000000"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Background Color (Light)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="color-swatch">
                    <input type="color" value={qrLightColor} onChange={(e) => setQrLightColor(e.target.value)} id="qr-light-color" />
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={qrLightColor}
                    onChange={(e) => setQrLightColor(e.target.value)}
                    placeholder="#ffffff"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Size (pixels): {qrSize}px</label>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                  id="qr-size-slider"
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-tertiary)" }}>
                  <span>100px</span><span>800px</span>
                </div>
              </div>

              
{/* Preview */}
<div
  style={{
    padding: "16px",
    background: qrLightColor,
    borderRadius: "var(--radius-md)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    border: "1.5px solid var(--border-color)",
  }}
>
  <div
    style={{
      width: "160px",
      height: "160px",
      maxWidth: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: qrLightColor,
    }}
  >
    {qrCampaign.qrCode ? (
      <img
        src={qrCampaign.qrCode}
        alt="QR Code Preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    ) : (
      <p style={{ color: qrDarkColor, fontSize: "12px" }}>
        Generate QR Code to preview
      </p>
    )}
  </div>

  <p
    style={{
      fontSize: "12px",
      color: qrDarkColor,
      fontWeight: 600,
    }}
  >
    Preview
  </p>
</div>

            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowQRModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleSubmitQR}
                disabled={generatingQR}
                id="generate-qr-btn"
              >
                {generatingQR ? "Generating..." : "Generate QR Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header flex-between" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">
            {pagination
              ? `${pagination.totalCampaigns} campaign${pagination.totalCampaigns !== 1 ? "s" : ""} found`
              : "Manage your QR marketing campaigns."}
          </p>
        </div>
        <button
          onClick={() => { setShowCreateForm(!showCreateForm); setShowEditForm(false); }}
          className="btn btn-primary"
          id="create-campaign-toggle-btn"
        >
          {showCreateForm ? "✕ Close" : "+ Create Campaign"}
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h2 className="card-title">Create New Campaign</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateCampaign}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Campaign Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Sale 2024"
                    required
                    maxLength={100}
                    id="create-campaign-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    id="create-campaign-url"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    id="create-campaign-category"
                  >
                    {CAMPAIGN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter campaign description (optional)"
                  rows={3}
                  maxLength={500}
                  id="create-campaign-description"
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                  id="create-campaign-submit-btn"
                >
                  {creating ? "Creating..." : "Create Campaign"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Form */}
      {showEditForm && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h2 className="card-title">Edit Campaign</h2>
            <button className="btn-icon" onClick={() => setShowEditForm(false)}>✕</button>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateCampaign}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Campaign Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    maxLength={100}
                    id="edit-campaign-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    value={editTargetUrl}
                    onChange={(e) => setEditTargetUrl(e.target.value)}
                    required
                    id="edit-campaign-url"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    id="edit-campaign-status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    id="edit-campaign-category"
                  >
                    {CAMPAIGN_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  id="edit-campaign-description"
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                  id="update-campaign-btn"
                >
                  {updating ? "Updating..." : "Update Campaign"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search, Filter, Sort Bar */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Search */}
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search campaigns..."
            style={{ flex: "2", minWidth: "200px" }}
            id="campaign-search-input"
          />

          {/* Status filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); }}
            style={{ flex: "1", minWidth: "120px" }}
            id="campaign-status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Category filter */}
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); }}
            style={{ flex: "1", minWidth: "140px" }}
            id="campaign-category-filter"
          >
            <option value="all">All Categories</option>
            {CAMPAIGN_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); }}
            style={{ flex: "1", minWidth: "160px" }}
            id="campaign-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-scanned">Most Scanned</option>
            <option value="least-scanned">Least Scanned</option>
          </select>

          {/* Date range */}
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ minWidth: "140px" }}
            title="Start date filter"
            id="campaign-start-date"
          />
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ minWidth: "140px" }}
            title="End date filter"
            id="campaign-end-date"
          />

          {(startDate || endDate || searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setSortBy("newest");
              }}
              id="campaign-clear-filters-btn"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2 className="empty-state-title">No Campaigns Found</h2>
            <p className="empty-state-description">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "No campaigns match your current filters. Try adjusting your search."
                : "Create your first QR marketing campaign to get started."}
            </p>
            {!searchTerm && statusFilter === "all" && categoryFilter === "all" && (
              <button
                className="btn btn-primary"
                style={{ marginTop: "20px" }}
                onClick={() => setShowCreateForm(true)}
              >
                + Create Campaign
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-auto">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="campaign-card" id={`campaign-card-${campaign._id}`}>
              {/* Header */}
              <div className="flex-between" style={{ marginBottom: "8px", gap: "8px", alignItems: "flex-start" }}>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}>
                  {campaign.name}
                </h2>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                  <span className="badge" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8", fontSize: "11px" }}>
                    {campaign.category || "General"}
                  </span>
                  <span className={`badge ${campaign.status === "active" ? "badge-active" : "badge-inactive"}`}>
                    {campaign.status === "active" ? "● Active" : "○ Inactive"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginBottom: "16px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {campaign.description || "No description provided."}
              </p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>Scans</p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-primary)" }}>
                    {campaign.scanCount || 0}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>Created</p>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginTop: "3px" }}>
                    {new Date(campaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

            
         {/* QR Preview */}
         {campaign.qrCode && (
           <div
             style={{
         display: "flex",
               alignItems: "center",
               gap: "12px",
               padding: "10px",
               background: "var(--bg-primary)",
               borderRadius: "var(--radius-md)",
               marginBottom: "16px",
               border: "1px solid var(--border-color)",
               minWidth: 0,
               boxSizing: "border-box",
               width: "100%",
             }}
           >
             <img
               src={campaign.qrCode}
               alt={`${campaign.name} QR Code`}
               style={{
                 width: "52px",
                 height: "52px",
                 objectFit: "contain",
                 borderRadius: "4px",
                 flexShrink: 0,
               }}
             />

             <div style={{ flex: "1 1 0", minWidth: 0 }}>
               <p
                 style={{
                   fontSize: "12px",
                   color: "var(--text-tertiary)",
                   marginBottom: "6px",
                 }}
               >
                 QR Code ready
               </p>

               <div
                 style={{
                   display: "flex",
                   flexWrap: "wrap",
                   gap: "6px",
                   alignItems: "center",
          minWidth: 0,
                 }}
          >
                 <button
          className="btn btn-sm btn-primary"
                   onClick={() => handleDownloadQR(campaign)}
          id={`download-qr-${campaign._id}`}
                   style={{
          flex: "1 1 auto",
                   minWidth: 0,
            whiteSpace: "nowrap",
          }}
                   >
          <DownloadIcon /> Download
                 </button>

        <button
         className="btn btn-sm btn-ghost"
         onClick={() => handleCopyLink(campaign._id)}
          id={`copy-link-${campaign._id}`}
                   title="Copy scan URL"
          style={{
                     flex: "1 1 auto",
            minWidth: 0,
                     whiteSpace: "nowrap",
          }}
         >
          <CopyIcon /> {copiedId === campaign._id ? "Copied!" : "Copy"}
         </button>
       </div>
      </div>
     </div>
           )}


              {/* Target URL */}
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                🔗 {campaign.targetUrl}
              </p>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setSelectedCampaign(campaign); setShowDetailsModal(true); }}
                  title="View details"
                  id={`view-campaign-${campaign._id}`}
                >
                  <EyeIcon /> View
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleEditCampaign(campaign)}
                  title="Edit campaign"
                  id={`edit-campaign-${campaign._id}`}
                >
                  <EditIcon /> Edit
                </button>

                <button
                  className="btn btn-sm"
                  onClick={() => handleGenerateQR(campaign)}
                  style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", border: "1px solid rgba(99,102,241,0.2)" }}
                  title="Generate QR code"
                  id={`qr-btn-${campaign._id}`}
                >
                  <QRIcon2 /> QR Code
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleCopyLink(campaign._id)}
                  title="Copy scan URL"
                  id={`copy-btn-${campaign._id}`}
                >
                  <CopyIcon /> {copiedId === campaign._id ? "Copied!" : "Copy Link"}
                </button>

                <button
                  className="btn btn-sm"
                  onClick={() => handleDeleteClick(campaign)}
                  style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid rgba(239,68,68,0.2)", marginLeft: "auto" }}
                  title="Delete campaign"
                  id={`delete-campaign-${campaign._id}`}
                >
                  <TrashIcon /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ marginTop: "28px" }}>
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(currentPage - 1)}
              id="pagination-prev"
            >
              ←
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} style={{ color: "var(--text-tertiary)", padding: "0 4px" }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`pagination-btn ${currentPage === p ? "active" : ""}`}
                    onClick={() => handlePageChange(p)}
                    id={`pagination-page-${p}`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              className="pagination-btn"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
              id="pagination-next"
            >
              →
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-tertiary)", marginTop: "12px" }}>
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCampaigns} campaigns)
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}