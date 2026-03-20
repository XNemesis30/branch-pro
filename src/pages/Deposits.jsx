import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, today } from "../utils/sheets";

function DepositModal({ onClose, onSave, cashBalance }) {
  const [form, setForm] = useState({ date:today(), amount:"", destination:"Bank", reference:"", note:"" });
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = async () => {
    if (!form.amount) { setError("Amount is required."); return; }
    if (parseFloat(form.amount)>cashBalance) { setError(`Amount exceeds current cash balance of ${formatCurrency(cashBalance)}.`); return; }
    try { await onSave(form); onClose(); } catch(e) { setError(e.message); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Record Deposit</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error&&<div className="alert alert-error">{error}</div>}
          <div style={{background:"var(--bg-elevated)",borderRadius:"8px",padding:"12px 16px",marginBottom:"20px"}}>
            <span style={{fontSize:"12px",color:"var(--text-muted)"}}>Available Cash: </span>
            <span className="amount" style={{color:"var(--success)",fontWeight:700}}>{formatCurrency(cashBalance)}</span>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
            <div className="form-group"><label>Amount (৳) *</label><input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="Amount to deposit"/></div>
            <div className="form-group"><label>Destination *</label>
              <select value={form.destination} onChange={e=>set("destination",e.target.value)}>
                <option value="Bank">Bank Account</option>
                <option value="Mother Company">Mother Company</option>
              </select>
            </div>
            <div className="form-group"><label>Reference / Slip #</label><input value={form.reference} onChange={e=>set("reference",e.target.value)} placeholder="Deposit slip reference"/></div>
            <div className="form-group full"><label>Note</label><input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Optional note"/></div>
          </div>
          <div className="alert alert-warning" style={{marginTop:"16px",marginBottom:"0"}}>
            ⚠ This will deduct {form.amount?formatCurrency(form.amount):"the amount"} from Cash Ledger
            {form.destination==="Bank"?" and add to Bank Ledger.":"."}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Record Deposit</button>
        </div>
      </div>
    </div>
  );
}

export default function Deposits() {
  const { deposits, addDeposit, getCashBalance, getBankBalance } = useApp();
  const [showModal, setShowModal] = useState(false);

  const sorted = [...deposits].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const bankDeposits = deposits.filter(d=>d.destination==="Bank");
  const mcDeposits = deposits.filter(d=>d.destination==="Mother Company");
  const totalBank = bankDeposits.reduce((s,d)=>s+(parseFloat(d.amount)||0),0);
  const totalMC = mcDeposits.reduce((s,d)=>s+(parseFloat(d.amount)||0),0);

  return (
    <div>
      <div className="page-header"><h2>Cash Deposits</h2><p>Record cash deposited to bank or sent to mother company</p></div>

      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:"20px"}}>
        <div className="stat-card success"><div className="stat-label">Cash Balance</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(getCashBalance())}</div></div>
        <div className="stat-card"><div className="stat-label">Bank Balance</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(getBankBalance())}</div></div>
        <div className="stat-card"><div className="stat-label">Deposited to Bank</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(totalBank)}</div><div className="stat-sub">{bankDeposits.length} deposits</div></div>
        <div className="stat-card"><div className="stat-label">Sent to Mother Co.</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(totalMC)}</div><div className="stat-sub">{mcDeposits.length} transfers</div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-right" style={{marginLeft:"auto"}}>
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Record Deposit</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Amount</th><th>Destination</th><th>Reference</th><th>Note</th></tr></thead>
            <tbody>
              {sorted.length===0&&<tr><td colSpan={5}><div className="empty-state"><p>No deposits recorded</p></div></td></tr>}
              {sorted.map(d=>(
                <tr key={d.id}>
                  <td className="mono" style={{fontSize:"12px"}}>{d.date}</td>
                  <td className="amount amount-negative" style={{fontWeight:700}}>{formatCurrency(d.amount)}</td>
                  <td><span className={`badge ${d.destination==="Bank"?"badge-active":"badge-paid"}`}>{d.destination}</span></td>
                  <td className="mono" style={{fontSize:"12px",color:"var(--accent)"}}>{d.reference||"—"}</td>
                  <td style={{fontSize:"12px",color:"var(--text-muted)"}}>{d.note||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal&&<DepositModal onClose={()=>setShowModal(false)} onSave={addDeposit} cashBalance={getCashBalance()}/>}
    </div>
  );
}
