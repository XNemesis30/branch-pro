import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/sheets";

function LoanModal({ employees, onClose, onSave }) {
  const [form, setForm] = useState({
    employeeId: "", amount: "", issueDate: new Date().toISOString().split("T")[0],
    repaymentType: "monthly", monthlyDeduction: "", notes: "",
  });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.employeeId || !form.amount) { setError("Employee and amount are required."); return; }
    if (form.repaymentType === "monthly" && !form.monthlyDeduction) {
      setError("Monthly deduction amount is required for monthly repayment."); return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Issue Loan</h3>
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
              <label>Loan Amount (৳) *</label>
              <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="Total loan amount" />
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" value={form.issueDate} onChange={e => set("issueDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Repayment Type</label>
              <select value={form.repaymentType} onChange={e => set("repaymentType", e.target.value)}>
                <option value="monthly">Monthly Deduction</option>
                <option value="onetime">One-Time Repayment</option>
              </select>
            </div>
            {form.repaymentType === "monthly" && (
              <div className="form-group">
                <label>Monthly Deduction (৳) *</label>
                <input type="number" value={form.monthlyDeduction} onChange={e => set("monthlyDeduction", e.target.value)}
                  placeholder="Deduct per month from salary" />
              </div>
            )}
            <div className="form-group full">
              <label>Notes</label>
              <input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Reason for loan" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Issue Loan</button>
        </div>
      </div>
    </div>
  );
}

export default function Loans() {
  const { loans, employees, issueLoan, repayLoanFull } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  const filtered = loans.filter(l => filter === "All" || l.status === filter.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <h2>Loan Management</h2>
        <p>Track employee loans, deductions, and repayments</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: "140px" }}>
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Issue Loan</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Loan Amount</th>
                <th>Issue Date</th>
                <th>Repayment</th>
                <th>Deducted</th>
                <th>Remaining</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9}><div className="empty-state"><p>No loan records found</p></div></td></tr>
              )}
              {filtered.map(loan => {
                const pct = parseFloat(loan.amount) > 0
                  ? Math.round(((parseFloat(loan.amount) - parseFloat(loan.remaining)) / parseFloat(loan.amount)) * 100)
                  : 100;
                return (
                  <tr key={loan.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{loan.employeeName}</div>
                    </td>
                    <td className="amount" style={{ fontWeight: 700 }}>{formatCurrency(loan.amount)}</td>
                    <td className="mono" style={{ fontSize: "12px" }}>{loan.issueDate}</td>
                    <td>
                      {loan.repaymentType === "monthly"
                        ? <span className="mono" style={{ fontSize: "12px" }}>{formatCurrency(loan.monthlyDeduction)}/mo</span>
                        : <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>One-time</span>}
                    </td>
                    <td className="amount amount-positive">{formatCurrency(loan.totalDeducted)}</td>
                    <td className="amount" style={{ color: parseFloat(loan.remaining) > 0 ? "var(--danger)" : "var(--success)" }}>
                      {formatCurrency(loan.remaining)}
                    </td>
                    <td style={{ minWidth: "120px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "var(--bg-elevated)", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "var(--success)" : "var(--accent)", borderRadius: "99px" }} />
                        </div>
                        <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${loan.status === "active" ? "badge-partial" : "badge-paid"}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      {loan.status === "active" && (
                        <button className="btn btn-success btn-sm"
                          onClick={() => { if (confirm("Mark this loan as fully repaid?")) repayLoanFull(loan.id); }}>
                          Mark Repaid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <LoanModal employees={employees} onClose={() => setShowModal(false)} onSave={issueLoan} />
      )}
    </div>
  );
}
