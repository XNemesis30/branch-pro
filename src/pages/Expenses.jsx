import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, today } from "../utils/sheets";

const DEFAULT_CATS = ["transport","entertainment","snacks","office supplies","electricity","internet","maintenance","emergency","rent","other"];

function ExpenseModal({ onClose, onSave, customCats }) {
  const allCats = [...new Set([...DEFAULT_CATS, ...customCats])];
  const [form, setForm] = useState({ date:today(), category:"transport", amount:"", paymentMethod:"Cash", note:"" });
  const [customCat, setCustomCat] = useState("");
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.amount||!form.category) { setError("Category and amount are required."); return; }
    const finalForm = { ...form, category: form.category==="__custom__" ? customCat : form.category };
    if (form.category==="__custom__"&&!customCat) { setError("Enter a custom category name."); return; }
    try { await onSave(finalForm); onClose(); } catch(e) { setError(e.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Add Expense</h3><button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error&&<div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
            <div className="form-group"><label>Category *</label>
              <select value={form.category} onChange={e=>set("category",e.target.value)}>
                {allCats.map(c=><option key={c} value={c} style={{textTransform:"capitalize"}}>{c}</option>)}
                <option value="__custom__">+ Add custom category</option>
              </select>
            </div>
            {form.category==="__custom__"&&<div className="form-group"><label>Custom Category Name *</label><input value={customCat} onChange={e=>setCustomCat(e.target.value)} placeholder="e.g. courier fee"/></div>}
            <div className="form-group"><label>Amount (৳) *</label><input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="Expense amount"/></div>
            <div className="form-group"><label>Paid By</label>
              <select value={form.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
                <option>Cash</option><option>Bank</option><option>Mobile Banking</option>
              </select>
            </div>
            <div className="form-group full"><label>Note</label><input value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Description of expense"/></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={submit}>Record Expense</button>
        </div>
      </div>
    </div>
  );
}

export default function Expenses() {
  const { expenseEntries, addExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [customCats, setCustomCats] = useState([]);

  const allCats = [...new Set([...DEFAULT_CATS, ...customCats, ...expenseEntries.map(e=>e.category)])];

  const filtered = [...expenseEntries].sort((a,b)=>new Date(b.date)-new Date(a.date)).filter(e=>{
    const ms = !search||e.category.toLowerCase().includes(search.toLowerCase())||e.note.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter==="All"||e.category===catFilter;
    return ms&&mc;
  });

  const total = filtered.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const cashTotal = filtered.filter(e=>e.paymentMethod==="Cash").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const bankTotal = filtered.filter(e=>e.paymentMethod!=="Cash").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);

  const handleSave = async (form) => {
    if (!allCats.includes(form.category)) setCustomCats(prev=>[...prev, form.category]);
    await addExpense(form);
  };

  // Category breakdown
  const catBreakdown = allCats.map(c=>({cat:c, total:expenseEntries.filter(e=>e.category===c).reduce((s,e)=>s+(parseFloat(e.amount)||0),0)})).filter(x=>x.total>0).sort((a,b)=>b.total-a.total).slice(0,5);

  return (
    <div>
      <div className="page-header"><h2>Daily Expenses</h2><p>Branch operating expenses</p></div>

      <div className="stat-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:"20px"}}>
        <div className="stat-card danger"><div className="stat-label">Total Expenses (filtered)</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(total)}</div></div>
        <div className="stat-card"><div className="stat-label">Cash Expenses</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(cashTotal)}</div></div>
        <div className="stat-card"><div className="stat-label">Bank Expenses</div><div className="stat-value" style={{fontSize:"22px"}}>{formatCurrency(bankTotal)}</div></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:"20px",marginBottom:"20px"}}>
        <div>
          <div className="toolbar">
            <div className="toolbar-left">
              <input className="search-input" placeholder="Search category, note..." value={search} onChange={e=>setSearch(e.target.value)}/>
              <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{width:"150px"}}>
                <option value="All">All Categories</option>
                {allCats.map(c=><option key={c} value={c} style={{textTransform:"capitalize"}}>{c}</option>)}
              </select>
            </div>
            <div className="toolbar-right">
              <button className="btn btn-danger" onClick={()=>setShowModal(true)}>+ Add Expense</button>
            </div>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Paid By</th><th>Note</th></tr></thead>
                <tbody>
                  {filtered.length===0&&<tr><td colSpan={5}><div className="empty-state"><p>No expense records</p></div></td></tr>}
                  {filtered.map(e=>(
                    <tr key={e.id}>
                      <td className="mono" style={{fontSize:"12px"}}>{e.date}</td>
                      <td><span className="badge badge-partial" style={{textTransform:"capitalize"}}>{e.category}</span></td>
                      <td className="amount amount-negative" style={{fontWeight:700}}>{formatCurrency(e.amount)}</td>
                      <td style={{fontSize:"12px",color:"var(--text-muted)"}}>{e.paymentMethod}</td>
                      <td style={{fontSize:"12px",color:"var(--text-muted)"}}>{e.note||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card" style={{height:"fit-content"}}>
          <div className="section-title">Top Categories</div>
          {catBreakdown.map(({cat,total:t},i)=>(
            <div key={cat} style={{marginBottom:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span style={{fontSize:"12px",textTransform:"capitalize",fontWeight:500}}>{cat}</span>
                <span className="mono" style={{fontSize:"12px",color:"var(--danger)"}}>{formatCurrency(t)}</span>
              </div>
              <div style={{height:"4px",background:"var(--bg-elevated)",borderRadius:"99px",overflow:"hidden"}}>
                <div style={{width:`${Math.min(100,(t/catBreakdown[0].total)*100)}%`,height:"100%",background:`hsl(${i*40},70%,55%)`,borderRadius:"99px"}}/>
              </div>
            </div>
          ))}
          {catBreakdown.length===0&&<p style={{color:"var(--text-muted)",fontSize:"13px"}}>No data yet</p>}
        </div>
      </div>

      {showModal&&<ExpenseModal onClose={()=>setShowModal(false)} onSave={handleSave} customCats={customCats}/>}
    </div>
  );
}
