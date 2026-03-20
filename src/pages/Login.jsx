import { useState } from "react";
import { useApp } from "../context/AppContext";
import { SHEETS_CONFIG } from "../utils/sheets";
import { ROLE_COLORS, ROLE_LABELS } from "../utils/roles";

const ROLE_OPTIONS = [
  { role: "admin",    label: "Admin",    icon: "🔐", desc: "Full system access" },
  { role: "manager",  label: "Manager",  icon: "📊", desc: "Finance + Payroll view" },
  { role: "employee", label: "Staff",    icon: "👤", desc: "Finance entry only" },
];

export default function Login() {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isConfigured = !!SHEETS_CONFIG.SPREADSHEET_ID;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(selectedRole, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Branch Pro</h1>
        <p className="subtitle">Branch Finance & Payroll Management</p>

        {!isConfigured && (
          <div className="config-note">
            ⚠ Demo Mode — Google Sheets not configured. Data won't be saved.
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          {/* Role selector */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Sign in as</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {ROLE_OPTIONS.map(({ role, label, icon, desc }) => (
                <div
                  key={role}
                  onClick={() => { setSelectedRole(role); setPassword(""); setError(""); }}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: "10px", cursor: "pointer",
                    border: `2px solid ${selectedRole === role ? ROLE_COLORS[role] : "var(--border)"}`,
                    background: selectedRole === role ? `${ROLE_COLORS[role]}15` : "var(--bg-elevated)",
                    textAlign: "center", transition: "var(--transition)",
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{icon}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: selectedRole === role ? ROLE_COLORS[role] : "var(--text)" }}>{label}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>{ROLE_LABELS[selectedRole]} Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`Enter ${ROLE_LABELS[selectedRole].toLowerCase()} password`}
              autoFocus
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : `Sign in as ${ROLE_LABELS[selectedRole]}`}
          </button>
        </form>

        <div style={{ marginTop: "20px", padding: "14px", background: "var(--bg-elevated)", borderRadius: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>Default passwords (change in .env)</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span>Admin: <span className="mono" style={{ color: "var(--accent)" }}>admin123</span></span>
            <span>Manager: <span className="mono" style={{ color: "var(--success)" }}>manager123</span></span>
            <span>Staff: <span className="mono" style={{ color: "var(--warning)" }}>staff123</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
