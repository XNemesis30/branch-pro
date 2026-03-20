import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/sheets";
import DeleteBtn from "../components/DeleteBtn";

const METHOD_COLORS = {
  bKash: "#e91e8c", Nagad: "#e84118", Rocket: "#6c2d9e",
};
const TYPE_COLOR = {
  income: "var(--success)", expense: "var(--danger)",
  salary: "var(--warning)", deposit: "var(--accent)",
};

export default function MobileLedger() {
  const { mobileLedger, getMobileBalance, deleteMobileLedgerRow } = useApp();
  const sorted = [...mobileLedger].sort((a, b) => new Date(a.date) - new Date(b.date));
  const balance = getMobileBalance();

  const totalIn  = sorted.filter(e => e.direction === "in" ).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalOut = sorted.filter(e => e.direction === "out").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const today = new Date().toISOString().split("T")[0];
  const todayIn  = sorted.filter(e => e.date === today && e.direction === "in" ).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const todayOut = sorted.filter(e => e.date === today && e.direction === "out").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // Group by method
  const byMethod = ["bKash", "Nagad", "Rocket"].map(m => ({
    method: m,
    entries: sorted.filter(e => e.method === m),
    total: sorted.filter(e => e.method === m && e.direction === "in").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
      - sorted.filter(e => e.method === m && e.direction === "out").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
  }));

  return (
    <div>
      <div className="page-header">
        <h2>Mobile Banking Ledger</h2>
        <p>bKash · Nagad · Rocket — tracked separately from bank</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{
          background: "linear-gradient(135deg,#e91e8c15,#e91e8c05)",
          border: "1px solid #e91e8c30", borderRadius: "var(--radius)", padding: "20px",
        }}>
          <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "1px", color: "#e91e8c", marginBottom: "6px" }}>Total Mobile Balance</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: balance >= 0 ? "var(--success)" : "var(--danger)", letterSpacing: "-1px" }}>{formatCurrency(balance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today — Received</div>
          <div className="stat-value" style={{ fontSize: "20px", color: "var(--success)" }}>{formatCurrency(todayIn)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Today — Paid Out</div>
          <div className="stat-value" style={{ fontSize: "20px", color: "var(--danger)" }}>{formatCurrency(todayOut)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">All Time In</div>
          <div className="stat-value" style={{ fontSize: "20px", color: "var(--accent)" }}>{formatCurrency(totalIn)}</div>
        </div>
      </div>

      {/* Per-method breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
        {byMethod.map(({ method, entries, total }) => (
          <div key={method} style={{
            background: "var(--bg-card)", border: `1px solid ${METHOD_COLORS[method]}30`,
            borderRadius: "var(--radius)", padding: "16px",
            borderTop: `3px solid ${METHOD_COLORS[method]}`,
          }}>
            <div style={{ fontWeight: 700, color: METHOD_COLORS[method], marginBottom: "4px" }}>{method}</div>
            <div className="mono" style={{ fontSize: "20px", fontWeight: 700, color: total >= 0 ? "var(--success)" : "var(--danger)" }}>{formatCurrency(total)}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{entries.length} transactions</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "20px" }}>
        <div className="card">
          <div className="section-title">Mobile Transaction History</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Method</th><th>Type</th><th>Description</th>
                  <th>In (৳)</th><th>Out (৳)</th><th>TXN ID</th><th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 && (
                  <tr><td colSpan={8}><div className="empty-state"><p>No mobile transactions yet</p></div></td></tr>
                )}
                {[...sorted].reverse().map(e => (
                  <tr key={e.id}>
                    <td className="mono" style={{ fontSize: "12px" }}>{e.date}</td>
                    <td>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: METHOD_COLORS[e.method] || "var(--text-muted)" }}>
                        {e.method}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", color: TYPE_COLOR[e.type] || "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 600 }}>
                        {e.type}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px" }}>{e.description}</td>
                    <td className="amount amount-positive">{e.direction === "in"  ? formatCurrency(e.amount) : "—"}</td>
                    <td className="amount amount-negative">{e.direction === "out" ? formatCurrency(e.amount) : "—"}</td>
                    <td className="mono" style={{ fontSize: "11px", color: "var(--accent)" }}>{e.transactionId || "—"}</td>
                    <td><DeleteBtn onDelete={() => deleteMobileLedgerRow(e.id)} label="this mobile entry" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card">
            <div className="section-title">Summary</div>
            {[
              { label: "Total Received", val: totalIn,  color: "var(--success)" },
              { label: "Total Paid Out", val: totalOut, color: "var(--danger)" },
              { label: "Net Balance",    val: balance,  color: balance >= 0 ? "var(--success)" : "var(--danger)" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{label}</span>
                <span className="mono" style={{ color, fontWeight: 700, fontSize: "13px" }}>{formatCurrency(val)}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.7", fontSize: "12px" }}>
              <strong style={{ color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>Note</strong>
              bKash, Nagad, and Rocket transactions are tracked here separately from the Bank Ledger.
              This balance represents total mobile money in/out — not a wallet balance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
