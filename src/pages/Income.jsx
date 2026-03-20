import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, today } from "../utils/sheets";

const CATEGORIES = ["product sale","service payment","due payment","advance payment","miscellaneous income"];
const METHODS = ["Cash","Bank Transfer","bKash","Nagad","Rocket","Card Payment","Cheque"];
const CASH_METHODS = ["Cash"];

function IncomeModal({ onClose, onSave }) {
  const [form, setForm] = useState({ date:today(), customerName:"", amount:"", paymentMethod:"Cash", transactionId:"", senderAccount:"", category:"product sale", note:"" });
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const needsTxn = !CASH_METHODS.includes(form.paymentMethod);

  const submit = async () => {
    setError("");
    if (!form.customerName||!form.amount) { setError("Customer name and amount are required."); return; }
    if (needsTxn && !form.transactionId) { setError("Transaction ID is mandatory for non-cash payments."); return; }
    try { await onSave(form); onClose(); } catch(e) { setError(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Customer Payment</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
            <div className="form-group"><label>Customer Name *</label><input value={form.customerName} onChange={e=>set("customerName",e.target.value)} placeholder="Customer / company name"/></div>
            <div className="form-group"><label>Amount (৳) *</label><input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="Payment amount"/></div>
            <div className="form-group"><label>Payment Method</label>
              <select value={form.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
                {METHODS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Category</label>
              <select value={form.category} onChange={e=>set("category",e.target.value)}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Transaction ID {needsTxn?"*":"(optional)"}</label>
              <input value={form.transactionId} onChange={e=>set("transactionId",e.target.value)} placeholder={needsTxn?"Required":"N/A for cash"} style={needsTxn&&!form.transactionId?{borderColor:"var(--danger)"}:{}}/>
              {needsTxn && <span style={{fontSize:"11px",color:"var(--danger)",marginTop:"3px",display:"block"}}>⚠ Required for {form.paymentMethod}</span>}
            </div>
            <div className="form-group"><label>Sender Account</label><input value={form.senderAccount} onChange={e=>set("senderAccount",e.target.value)} placeholder="Mobile/account number"/></div>
            <div className="form-group full"><label>Note</label><input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Optional note"/></div>
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

export default function Income() {
  const { incomeEntries, addIncome } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");

  const filtered = [...incomeEntries].sort((a,b)=>new Date(b.date)-new Date(a.date)).filter(e=>{
    const ms = !search||e.customerName.toLowerCase().includes(search.toLowerCase())||e.note.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter==="All"||e.category===catFilter;
    const mm = methodFilter==="All"||e.paymentMethod===methodFilter;
    return ms&&mc&&mm;
  });

  const totalIncome = filtered.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const cashIncome = filtered.filter(e=>e.paymentMethod==="Cash").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const bankIncome = filtered.filter(e=>e.paymentMethod!=="Cash").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);

  const methodColor = m => ({Cash:"var(--success)",bKash:"#e91e8c",Nagad:"#e84118",Rocket:"#6c2d9e","Bank Transfer":"var(--accent)","Card Payment":"var(--warning)",Cheque:"var(--text-muted)"}[m]||"var(--text-muted)");

  return (
    <div>
      <div className="page-header"><h2>Daily Income</h2><p>Customer payments received by the branch</p></div>

      <div className="stat-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:"20px"}}>
        <div className="stat-card success"><div className="stat-label">Total Income (filtered)</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(totalIncome)}</div></div>
        <div className="stat-card"><div className="stat-label">Cash Received</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(cashIncome)}</div></div>
        <div className="stat-card"><div className="stat-label">Digital / Bank</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(bankIncome)}</div></div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="Search customer, note..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{width:"160px"}}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={methodFilter} onChange={e=>setMethodFilter(e.target.value)} style={{width:"140px"}}>
            <option value="All">All Methods</option>
            {METHODS.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Add Payment</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Category</th><th>Transaction ID</th><th>Note</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={7}><div className="empty-state"><p>No income records found</p></div></td></tr>}
              {filtered.map(e=>(
                <tr key={e.id}>
                  <td className="mono" style={{fontSize:"12px"}}>{e.date}</td>
                  <td style={{fontWeight:500}}>{e.customerName}</td>
                  <td className="amount amount-positive" style={{fontWeight:700}}>{formatCurrency(e.amount)}</td>
                  <td><span style={{fontSize:"12px",color:methodColor(e.paymentMethod),fontWeight:600}}>{e.paymentMethod}</span></td>
                  <td><span className="badge badge-active" style={{textTransform:"capitalize",fontSize:"10px"}}>{e.category}</span></td>
                  <td className="mono" style={{fontSize:"11px",color:"var(--accent)"}}>{e.transactionId||<span style={{color:"var(--text-muted)"}}>Cash</span>}</td>
                  <td style={{color:"var(--text-muted)",fontSize:"12px"}}>{e.note||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal&&<IncomeModal onClose={()=>setShowModal(false)} onSave={addIncome}/>}
    </div>
  );
}
