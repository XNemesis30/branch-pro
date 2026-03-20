import { useState } from "react";
import { useApp } from "../context/AppContext";
import { SHEETS_CONFIG } from "../utils/sheets";

export default function Login() {
  const { login } = useApp();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = !!SHEETS_CONFIG.SPREADSHEET_ID;

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Branch Pro</h1>
        <p className="subtitle">Employee Salary Management System</p>

        {!isConfigured && (
          <div className="config-note">
            ⚠ Running in Demo Mode — Google Sheets not configured.<br />
            Data will not be saved. See setup guide below.
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : isConfigured ? "Sign In & Connect Google Sheets" : "Sign In (Demo Mode)"}
          </button>
        </form>

        <div style={{ marginTop: "24px", padding: "16px", background: "var(--bg-elevated)", borderRadius: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>Default credentials</strong>
          Password: <span className="mono" style={{ color: "var(--accent)" }}>admin123</span>
          <br />
          <span style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>Change via VITE_ADMIN_PASSWORD env variable</span>
        </div>
      </div>
    </div>
  );
}
