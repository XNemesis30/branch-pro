import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, monthLabel } from "../utils/sheets";
import DeleteBtn from "../components/DeleteBtn";

function PaymentModal({ record, employee, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: "", method: "bKash", transactionId: "", senderAccount: "",
    date: new Date().toISOString().split("T")[0], note: "",
  });
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const balance = parseFloat(record.balance) || 0;
  const needsTxnId = form.method !== "Cash";

  const submit = async () => {
    setError("");
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Enter a valid amount."); return; }
    if (parseFloat(form.amount) > balance) { setError(`Amount exceeds balance of ${formatCurrency(balance)}.`); return; }
    if (needsTxnId && !form.transactionId.trim()) {
      setError("Transaction ID is required for mobile/bank payments. Cannot save without it.");
      return;
    }
    try {
      await onSave(record.id, form);
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Record Payment — {employee?.name}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", display: "flex", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Total Payable</div>
              <div className="amount" style={{ fontSize: "16px", fontWeight: 700 }}>{formatCurrency(record.totalPayable)}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--success)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Already Paid</div>
              <div className="amount amount-positive" style={{ fontSize: "16px", fontWeight: 700 }}>{formatCurrency(record.totalWithdrawn)}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "var(--warning)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Balance Due</div>
              <div className="amount" style={{ color: "var(--warning)", fontSize: "16px", fontWeight: 700 }}>{formatCurrency(balance)}</div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Payment Amount (৳) *</label>
              <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)}
                placeholder={`Max: ${formatCurrency(balance)}`} autoFocus />
            </div>
            <div className="form-group">
              <label>Payment Date *</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Payment Method *</label>
              <select value={form.method} onChange={e => set("method", e.target.value)}>
                <option>bKash</option>
                <option>Nagad</option>
                <option>Rocket</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sender Account</label>
              <input value={form.senderAccount} onChange={e => set("senderAccount", e.target.value)} placeholder="Your number/account" />
            </div>
            <div className="form-group full">
              <label>Transaction ID {needsTxnId ? "*" : "(optional)"}</label>
              <input value={form.transactionId} onChange={e => set("transactionId", e.target.value)}
                placeholder={needsTxnId ? "Required — e.g. TXN123456789" : "Optional for cash"}
                style={needsTxnId && !form.transactionId ? { borderColor: "var(--danger)" } : {}} />
              {needsTxnId && <span style={{ fontSize: "11px", color: "var(--danger)", marginTop: "4px" }}>⚠ Transaction ID mandatory for {form.method} payments</span>}
            </div>
            <div className="form-group full">
              <label>Note</label>
              <input value={form.note} onChange={e => set("note", e.target.value)} placeholder="Optional note" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Save Payment</button>
        </div>
      </div>
    </div>
  );
}

function GenerateSalaryModal({ employees, existing, onClose, onGenerate }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState([]);
  const [generating, setGenerating] = useState(false);

  const activeEmps = employees.filter(e => e.status === "Active" || e.status === "Rehired");
  const alreadyGenerated = (empId) => existing.some(r => r.employeeId === empId && parseInt(r.month) === month && parseInt(r.year) === year);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === activeEmps.length ? [] : activeEmps.map(e => e.id));

  const generate = async () => {
    setGenerating(true);
    for (const empId of selected) {
      if (!alreadyGenerated(empId)) await onGenerate(empId, month, year);
    }
    setGenerating(false);
    onClose();
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i, 1).toLocaleString("default", { month: "long" }) }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "540px" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Generate Salary Records</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid" style={{ marginBottom: "20px" }}>
            <div className="form-group">
              <label>Month</label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Select employees to generate salary for:</span>
            <button className="btn btn-secondary btn-sm" onClick={toggleAll}>
              {selected.length === activeEmps.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
            {activeEmps.map(emp => {
              const generated = alreadyGenerated(emp.id);
              return (
                <label key={emp.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px", cursor: generated ? "not-allowed" : "pointer", opacity: generated ? 0.5 : 1 }}>
                  <input type="checkbox" checked={selected.includes(emp.id)} disabled={generated}
                    onChange={() => !generated && toggle(emp.id)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: "13px" }}>{emp.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{emp.id}</div>
                  </div>
                  <div className="amount" style={{ fontSize: "12px" }}>{formatCurrency(emp.salary)}</div>
                  {generated && <span className="badge badge-paid" style={{ fontSize: "10px" }}>done</span>}
                </label>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={generate} disabled={selected.length === 0 || generating}>
            {generating ? "Generating..." : `Generate for ${selected.length} employees`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Salary() {
  const { employees, salaryRecords, transactions, recordPayment, generateSalaryRecord, caps, deleteSalary, deleteTransaction } = useApp();
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [statusFilter, setStatusFilter] = useState("All");
  const [payModal, setPayModal] = useState(null);
  const [genModal, setGenModal] = useState(false);
  const [txnRecord, setTxnRecord] = useState(null);

  const filtered = salaryRecords.filter(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    const name = emp?.name || r.employeeName || "";
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || r.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchMonth = !monthFilter || r.month === monthFilter;
    const matchYear = !yearFilter || r.year === yearFilter;
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchMonth && matchYear && matchStatus;
  }).sort((a, b) => (parseInt(b.year) * 12 + parseInt(b.month)) - (parseInt(a.year) * 12 + parseInt(a.month)));

  const getEmpTxn = (recordId) => transactions.filter(t => t.salaryRecordId === recordId);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i, 1).toLocaleString("default", { month: "long" }) }));

  return (
    <div>
      <div className="page-header">
        <h2>Salary Management</h2>
        <p>Track salary records, payments, and carry-forward balances</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ width: "130px" }}>
            <option value="">All Months</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input type="number" value={yearFilter} onChange={e => setYearFilter(e.target.value)} placeholder="Year" style={{ width: "80px" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: "120px" }}>
            <option>All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        <div className="toolbar-right">
          {caps.canGenerateSalary && <button className="btn btn-primary" onClick={() => setGenModal(true)}>+ Generate Salary</button>}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month / Year</th>
                <th>Base Salary</th>
                <th>Bonus</th>
                <th>Loan Ded.</th>
                <th>Total Payable</th>
                <th>Withdrawn</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10}><div className="empty-state"><p>No salary records. Generate salary first.</p></div></td></tr>
              )}
              {filtered.map(r => {
                const emp = employees.find(e => e.id === r.employeeId);
                const empTxns = getEmpTxn(r.id);
                return (
                  <>
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.employeeName}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.employeeId}</div>
                      </td>
                      <td><span className="mono">{r.month}/{r.year}</span></td>
                      <td className="amount">{formatCurrency(r.baseSalary)}</td>
                      <td className="amount" style={{ color: "var(--accent)" }}>{formatCurrency(r.bonus)}</td>
                      <td className="amount amount-negative">{formatCurrency(r.loanDeduction)}</td>
                      <td className="amount" style={{ fontWeight: 700 }}>{formatCurrency(r.totalPayable)}</td>
                      <td className="amount amount-positive">{formatCurrency(r.totalWithdrawn)}</td>
                      <td className="amount" style={{ color: parseFloat(r.balance) > 0 ? "var(--warning)" : "var(--success)" }}>{formatCurrency(r.balance)}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {r.status !== "paid" && caps.canRecordPayment && (
                            <button className="btn btn-success btn-sm" onClick={() => setPayModal({ record: r, emp })}>
                              + Pay
                            </button>
                          )}
                          {empTxns.length > 0 && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setTxnRecord(txnRecord === r.id ? null : r.id)}>
                              TXN ({empTxns.length})
                            </button>
                          )}
                          <DeleteBtn onDelete={() => deleteSalary(r.id)} label="this salary record"/>
                        </div>
                      </td>
                    </tr>
                    {txnRecord === r.id && empTxns.map(txn => (
                      <tr key={txn.id} style={{ background: "var(--accent-dim)" }}>
                        <td colSpan={2} style={{ paddingLeft: "32px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>↳ {txn.date}</span>
                        </td>
                        <td colSpan={2} className="amount amount-positive">{formatCurrency(txn.amount)}</td>
                        <td colSpan={2}><span className="mono" style={{ fontSize: "11px" }}>{txn.method}</span></td>
                        <td colSpan={2}><span className="mono" style={{ fontSize: "11px", color: "var(--accent)" }}>{txn.transactionId || "Cash"}</span></td>
                        <td colSpan={1} style={{ fontSize: "11px", color: "var(--text-muted)" }}>{txn.senderAccount}</td>
                        <td colSpan={1}><DeleteBtn onDelete={() => deleteTransaction(txn.id)} label="this transaction"/></td>
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {payModal && (
        <PaymentModal
          record={payModal.record}
          employee={payModal.emp}
          onClose={() => setPayModal(null)}
          onSave={recordPayment}
        />
      )}

      {genModal && (
        <GenerateSalaryModal
          employees={employees}
          existing={salaryRecords}
          onClose={() => setGenModal(false)}
          onGenerate={generateSalaryRecord}
        />
      )}
    </div>
  );
}
