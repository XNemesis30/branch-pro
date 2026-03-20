import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, today } from "../utils/sheets";

function TransferModal({ onClose, onSave, cashBalance }) {
  const [form, setForm] = useState({ date:today(), amount:"", method:"bKash", reference:"", note:"" });
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = async () => {
    if (!form.amount) { setError("Amount is required."); return; }
    if (parseFloat(form.amount)>cashBalance) { setError(`Exceeds cash balance of ${formatCurrency(cashBalance)}.`); return; }
    try { await onSave(form); onClose(); } catch(e) { setError(e.message); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Send to Mother Company</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error&&<div className="alert alert-error">{error}</div>}
          <div style={{background:"var(--bg-elevated)",borderRadius:"8px",padding:"12px 16px",marginBottom:"20px"}}>
            <span style={{fontSize:"12px",color:"var(--text-muted)"}}>Available Cash: </span>
            <span className="amount" style={{color:"var(--success)",fontWeight:700}}>{formatCurrency(cashBalance)}</span>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
            <div className="form-group"><label>Amount (৳) *</label><input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)}/></div>
            <div className="form-group"><label>Transfer Method</label>
              <select value={form.method} onChange={e=>set("method",e.target.value)}>
                <option>bKash</option><option>Nagad</option><option>Bank Transfer</option><option>Cash Handover</option>
              </select>
            </div>
            <div className="form-group"><label>Reference</label><input value={form.reference} onChange={e=>set("reference",e.target.value)} placeholder="Transaction/reference ID"/></div>
            <div className="form-group full"><label>Note</label><input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="e.g. Weekly remittance"/></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Send Transfer</button>
        </div>
      </div>
    </div>
  );
}

export default function MotherCompany() {
  const { motherTransfers, addMotherTransfer, getCashBalance } = useApp();
  const [showModal, setShowModal] = useState(false);

  const sorted = [...motherTransfers].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const total = motherTransfers.reduce((s,m)=>s+(parseFloat(m.amount)||0),0);

  // Monthly breakdown
  const byMonth = motherTransfers.reduce((acc,m)=>{
    const key = m.date?.slice(0,7)||"unknown";
    acc[key] = (acc[key]||0)+(parseFloat(m.amount)||0);
    return acc;
  },{});
  const monthlyData = Object.entries(byMonth).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,6);

  return (
    <div>
      <div className="page-header"><h2>Mother Company Ledger</h2><p>Track all remittances sent to head office</p></div>

      <div className="stat-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:"20px"}}>
        <div className="stat-card"><div className="stat-label">Total Sent (All Time)</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(total)}</div></div>
        <div className="stat-card success"><div className="stat-label">Cash Balance</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(getCashBalance())}</div></div>
        <div className="stat-card"><div className="stat-label">Total Transfers</div><div className="stat-value">{motherTransfers.length}</div></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:"20px"}}>
        <div>
          <div className="toolbar">
            <div className="toolbar-right" style={{marginLeft:"auto"}}>
              <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Record Transfer</button>
            </div>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Note</th></tr></thead>
                <tbody>
                  {sorted.length===0&&<tr><td colSpan={5}><div className="empty-state"><p>No transfers recorded</p></div></td></tr>}
                  {sorted.map(m=>(
                    <tr key={m.id}>
                      <td className="mono" style={{fontSize:"12px"}}>{m.date}</td>
                      <td className="amount amount-negative" style={{fontWeight:700}}>{formatCurrency(m.amount)}</td>
                      <td style={{fontSize:"12px"}}>{m.method}</td>
                      <td className="mono" style={{fontSize:"11px",color:"var(--accent)"}}>{m.reference||"—"}</td>
                      <td style={{fontSize:"12px",color:"var(--text-muted)"}}>{m.note||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card" style={{height:"fit-content"}}>
          <div className="section-title">Monthly Summary</div>
          {monthlyData.length===0&&<p style={{color:"var(--text-muted)",fontSize:"13px"}}>No data yet</p>}
          {monthlyData.map(([month,amt])=>(
            <div key={month} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:"13px",fontWeight:500}}>{new Date(month+"-01").toLocaleString("default",{month:"long",year:"numeric"})}</span>
              <span className="mono" style={{color:"var(--accent)",fontWeight:700,fontSize:"13px"}}>{formatCurrency(amt)}</span>
            </div>
          ))}
        </div>
      </div>

      {showModal&&<TransferModal onClose={()=>setShowModal(false)} onSave={addMotherTransfer} cashBalance={getCashBalance()}/>}
    </div>
  );
}
