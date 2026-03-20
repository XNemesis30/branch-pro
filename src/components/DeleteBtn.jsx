import { useState } from "react";
import { useApp } from "../context/AppContext";

/**
 * Admin-only delete button with a two-step confirmation.
 * Props:
 *   onDelete  — async fn to call when confirmed
 *   label     — what is being deleted (e.g. "this income entry")
 */
export default function DeleteBtn({ onDelete, label = "this record" }) {
  const { caps } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!caps.canDelete) return null;

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onDelete();
    } catch (e) {
      setError(e.message);
      setBusy(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:"4px" }}>
        {error && <span style={{ fontSize:"11px", color:"var(--danger)" }}>{error}</span>}
        <button
          className="btn btn-danger btn-sm"
          onClick={handleConfirm}
          disabled={busy}
          style={{ fontSize:"11px" }}
        >
          {busy ? "Deleting..." : "Confirm"}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setConfirming(false)}
          style={{ fontSize:"11px" }}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      className="btn btn-danger btn-sm"
      title={`Delete ${label}`}
      onClick={() => setConfirming(true)}
    >
      🗑
    </button>
  );
}
