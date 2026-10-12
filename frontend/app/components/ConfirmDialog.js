"use client";

// Custom Confirmation Dialog
// window.confirm() ko replace karta hai - better UI ke saath
export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "danger",
  onConfirm,
  onCancel,
  icon = "⚠️",
}) {
  if (!isOpen) return null;

  const confirmButtonClass = {
    danger: "btn btn-danger",
    primary: "btn btn-primary",
    success: "btn btn-success",
  }[confirmStyle] || "btn btn-danger";

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal modal-sm">
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "16px", fontSize: "40px" }}>
          {icon}
        </div>

        {/* Title */}
        <h2
          id="confirm-title"
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "10px",
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "24px",
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={onCancel}
            id="confirm-dialog-cancel-btn"
          >
            {cancelText}
          </button>
          <button
            className={confirmButtonClass}
            style={{ flex: 1 }}
            onClick={onConfirm}
            id="confirm-dialog-confirm-btn"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
