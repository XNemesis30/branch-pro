import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, today } from "../utils/sheets";
import DeleteBtn from "../components/DeleteBtn";

function ChequeModal({ onClose, onSave }) {
  const [form, setForm] = useState({ customerName:"", chequeNumber:"", bankName:"", amount:"", issueDate:today(), receivedDate:today(), expectedClearDate:"", note:"" });
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const submit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Amount is required."); return; }
    try { await onSave(form); onClose(); } catch(e) { setError(e.message); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Add Cheque</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error&&<div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group"><label>Customer Name</label><input value={form.customerName} onChange={e=>set("customerName",e.target.value)} placeholder="Optional — cheque issuer"/></div>
            <div className="form-group"><label>Cheque Number</label><input value={form.chequeNumber} onChange={e=>set("chequeNumber",e.target.value)} placeholder="Optional — e.g. 001234"/></div>
            <div className="form-group"><label>Bank Name</label><input value={form.bankName} onChange={e=>set("bankName",e.target.value)} placeholder="Issuing bank"/></div>
            <div className="form-group"><label>Amount (৳) *</label><input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)}/></div>
            <div className="form-group"><label>Issue Date</label><input type="date" value={form.issueDate} onChange={e=>set("issueDate",e.target.value)}/></div>
            <div className="form-group"><label>Received Date</label><input type="date" value={form.receivedDate} onChange={e=>set("receivedDate",e.target.value)}/></div>
            <div className="form-group"><label>Expected Clear Date</label><input type="date" value={form.expectedClearDate} onChange={e=>set("expectedClearDate",e.target.value)}/></div>
            <div className="form-group"><label>Note</label><input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Optional note"/></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Add Cheque</button>
        </div>
      </div>
    </div>
  );
}

function CollectModal({ cheque, onClose, onSave }) {
  const [method, setMethod] = useState("Cash");
  const [txnId, setTxnId] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Manual Collection — {cheque.customerName}</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="alert alert-warning" style={{marginBottom:"16px"}}>Cheque #{cheque.chequeNumber} bounced. Record manual payment of {formatCurrency(cheque.amount)}.</div>
          <div className="form-grid">
            <div className="form-group"><label>Payment Method</label>
              <select value={method} onChange={e=>setMethod(e.target.value)}>
                <option>Cash</option><option>bKash</option><option>Nagad</option><option>Bank Transfer</option>
              </select>
            </div>
            {method!=="Cash"&&<div className="form-group"><label>Transaction ID *</label><input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="Required"/></div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={()=>{ onSave(cheque.id,{method,amount:cheque.amount,txnId}); onClose(); }}>Confirm Collection</button>
        </div>
      </div>
    </div>
  );
}

const STATUS_MAP = { pending:"badge-partial", deposited:"badge-active", cleared:"badge-paid", bounced:"badge-fired", "manually collected":"badge-rehired" };

export default function Cheques() {
  const { cheques, addCheque, updateChequeStatus, collectBouncedCheque, deleteCheque } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [collectCheque, setCollectCheque] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = cheques.filter(c=>filter==="All"||c.status===filter.toLowerCase()).sort((a,b)=>new Date(b.receivedDate)-new Date(a.receivedDate));

  const pending = cheques.filter(c=>c.status==="pending");
  const pendingAmt = pending.reduce((s,c)=>s+(parseFloat(c.amount)||0),0);
  const clearedAmt = cheques.filter(c=>c.status==="cleared").reduce((s,c)=>s+(parseFloat(c.amount)||0),0);
  const bouncedAmt = cheques.filter(c=>c.status==="bounced").reduce((s,c)=>s+(parseFloat(c.amount)||0),0);

  // Near-due alert (within 3 days)
  const nearDue = pending.filter(c=>{
    if (!c.expectedClearDate) return false;
    const diff = (new Date(c.expectedClearDate)-new Date())/86400000;
    return diff>=0&&diff<=3;
  });

  return (
    <div>
      <div className="page-header"><h2>Cheque Management</h2><p>Track all received cheques from pending to cleared</p></div>

      {nearDue.length>0&&(
        <div className="alert alert-warning" style={{marginBottom:"20px"}}>
          🔔 <strong>{nearDue.length} cheque(s)</strong> due within 3 days: {nearDue.map(c=>`${c.customerName} (${formatCurrency(c.amount)})`).join(", ")}
        </div>
      )}

      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:"20px"}}>
        <div className="stat-card warning"><div className="stat-label">Pending Cheques</div><div className="stat-value">{pending.length}</div><div className="stat-sub">{formatCurrency(pendingAmt)}</div></div>
        <div className="stat-card success"><div className="stat-label">Cleared</div><div className="stat-value">{cheques.filter(c=>c.status==="cleared").length}</div><div className="stat-sub">{formatCurrency(clearedAmt)}</div></div>
        <div className="stat-card danger"><div className="stat-label">Bounced</div><div className="stat-value">{cheques.filter(c=>c.status==="bounced").length}</div><div className="stat-sub">{formatCurrency(bouncedAmt)}</div></div>
        <div className="stat-card"><div className="stat-label">Total Cheques</div><div className="stat-value">{cheques.length}</div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          {["All","pending","deposited","cleared","bounced","manually collected"].map(s=>(
            <button key={s} className={`btn ${filter===s?"btn-primary":"btn-secondary"} btn-sm`} onClick={()=>setFilter(s)} style={{textTransform:"capitalize"}}>{s}</button>
          ))}
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Add Cheque</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Customer</th><th>Cheque #</th><th>Bank</th><th>Amount</th><th>Received</th><th>Expected Clear</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={8}><div className="empty-state"><p>No cheques found</p></div></td></tr>}
              {filtered.map(c=>{
                const daysLeft = c.expectedClearDate ? Math.ceil((new Date(c.expectedClearDate)-new Date())/86400000) : null;
                return (
                  <tr key={c.id}>
                    <td style={{fontWeight:500}}>{c.customerName}</td>
                    <td className="mono" style={{fontSize:"12px",color:"var(--accent)"}}>{c.chequeNumber}</td>
                    <td style={{fontSize:"12px",color:"var(--text-muted)"}}>{c.bankName||"—"}</td>
                    <td className="amount" style={{fontWeight:700}}>{formatCurrency(c.amount)}</td>
                    <td className="mono" style={{fontSize:"12px"}}>{c.receivedDate}</td>
                    <td>
                      <div className="mono" style={{fontSize:"12px"}}>{c.expectedClearDate||"—"}</div>
                      {daysLeft!==null&&c.status==="pending"&&<div style={{fontSize:"10px",color:daysLeft<=3?"var(--danger)":"var(--text-muted)"}}>{daysLeft<=0?"Overdue":`${daysLeft}d left`}</div>}
                    </td>
                    <td><span className={`badge ${STATUS_MAP[c.status]||"badge-active"}`}>{c.status}</span></td>
                    <td>
                      <div style={{display:"flex",gap:"6px"}}>
                        {c.status==="pending"&&<>
                          <button className="btn btn-success btn-sm" onClick={()=>updateChequeStatus(c.id,"cleared","Cleared")}>✓ Clear</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>updateChequeStatus(c.id,"bounced","Bounced")}>✗ Bounce</button>
                        </>}
                        {c.status==="bounced"&&<button className="btn btn-secondary btn-sm" onClick={()=>setCollectCheque(c)}>Collect</button>}
                        <DeleteBtn onDelete={()=>deleteCheque(c.id)} label="this cheque"/>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal&&<ChequeModal onClose={()=>setShowModal(false)} onSave={addCheque}/>}
      {collectCheque&&<CollectModal cheque={collectCheque} onClose={()=>setCollectCheque(null)} onSave={collectBouncedCheque}/>}
    </div>
  );
}
