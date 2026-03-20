import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { getSheetTabs, SHEETS } from "../utils/sheets";

const REQUIRED_TABS = Object.values(SHEETS);

export default function SetupChecker() {
  const { isLoggedIn, isDemo } = useApp();
  const [missing, setMissing] = useState([]);
  const [checked, setChecked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || isDemo || checked) return;
    (async () => {
      try {
        const tabs = await getSheetTabs();
        const miss = REQUIRED_TABS.filter(t => !tabs.includes(t));
        setMissing(miss);
      } catch(e) { /* silently skip if can't check */ }
      setChecked(true);
    })();
  }, [isLoggedIn, isDemo]);

  if (!checked || missing.length === 0 || dismissed) return null;

  return (
    <div style={{
      position: "fixed", top: "16px", right: "16px", zIndex: 2000,
      background: "var(--bg-card)", border: "1px solid var(--warning)",
      borderRadius: "var(--radius)", padding: "20px", width: "360px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <strong style={{ color: "var(--warning)", fontSize: "14px" }}>⚠ Missing Sheet Tabs</strong>
        <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}>✕</button>
      </div>
      <p style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "12px", lineHeight: "1.6" }}>
        The following tabs are missing from your Google Sheet. Create them to enable saving:
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
        {missing.map(tab => (
          <span key={tab} style={{ background: "var(--danger-dim)", color: "var(--danger)", padding: "3px 8px", borderRadius: "99px", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
            {tab}
          </span>
        ))}
      </div>
      <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.6" }}>
        In Google Sheets: right-click a tab at the bottom → <strong>Insert sheet</strong> → name it exactly as shown above.
        Then click <strong>↻ Reload Data</strong> in the sidebar.
      </p>
    </div>
  );
}
