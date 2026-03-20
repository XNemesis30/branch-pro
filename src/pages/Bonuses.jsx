import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/sheets";

function BonusModal({ employees, onClose, onSave }) {
  const [form, setForm] = useState({
    employeeId: "", amount: "",
    date: new Date().toISOString().split("T")[0],
    reason: "", type: "one-time",
  });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.employeeId || !form.amount || !form.reason) {
      setError("Employee, amount, and reason are required."); return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Bonus</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Employee *</label>
              <select value={form.employeeId} onChange={e => set("employeeId", e.target.value)}>
                <option value="">Select employee...</option>
                {employees.filter(e => e.status !== "Fired").map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bonus Amount (৳) *</label>
              <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="Amount" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bonus Type</label>
              <select value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="one-time">One-Time</option>
                <option value="eid">Eid Bonus</option>
                <option value="performance">Performance</option>
                <option value="festival">Festival</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Reason *</label>
              <input value={form.reason} onChange={e => set("reason", e.target.value)}
                placeholder="e.g. Eid bonus, Performance award, Special allowance" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Add Bonus</button>
        </div>
      </div>
    </div>
  );
}

export default function Bonuses() {
  const { bonuses, employees, addBonus } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = bonuses.filter(b =>
    !search || b.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    b.reason.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalBonuses = bonuses.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h2>Bonus Management</h2>
        <p>Track and manage all employee bonuses</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-label">Total Bonuses Given</div>
          <div className="stat-value" style={{ fontSize: "22px" }}>{formatCurrency(totalBonuses)}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Bonus Records</div>
          <div className="stat-value">{bonuses.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Bonus</div>
          <div className="stat-value" style={{ fontSize: "22px" }}>
            {formatCurrency(bonuses.length ? totalBonuses / bonuses.length : 0)}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="Search by employee or reason..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Bonus</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Type</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state"><p>No bonus records found</p></div></td></tr>
              )}
              {filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.employeeName}</td>
                  <td className="amount" style={{ color: "var(--success)", fontWeight: 700 }}>{formatCurrency(b.amount)}</td>
                  <td className="mono" style={{ fontSize: "12px" }}>{b.date}</td>
                  <td>
                    <span className="badge badge-active" style={{ textTransform: "capitalize" }}>{b.type}</span>
                  </td>
                  <td style={{ color: "var(--text-dim)" }}>{b.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BonusModal employees={employees} onClose={() => setShowModal(false)} onSave={addBonus} />
      )}
    </div>
  );
}
