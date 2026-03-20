import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/sheets";
import DeleteBtn from "../components/DeleteBtn";

const TYPE_COLOR = { income:"var(--success)", expense:"var(--danger)", salary:"var(--warning)", loan:"var(--danger)", deposit:"var(--accent)", transfer:"var(--text-muted)", "cheque recovery":"var(--success)", cheque:"var(--success)" };

export default function CashLedger() {
  const { cashLedger, getCashBalance, deleteCashLedgerRow } = useApp();
  const sorted = [...cashLedger].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const balance = getCashBalance();

  // Today's summary
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = sorted.filter(e=>e.date===today);
  const todayIn = todayEntries.filter(e=>e.direction==="in").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const todayOut = todayEntries.filter(e=>e.direction==="out").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);

  const totalIn = sorted.filter(e=>e.direction==="in").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const totalOut = sorted.filter(e=>e.direction==="out").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);

  return (
    <div>
      <div className="page-header"><h2>Cash Ledger</h2><p>All physical cash movements tracked in real-time</p></div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"24px"}}>
        <div className="stat-card" style={{gridColumn:"span 1"}}>
          <div className="stat-label">Current Cash Balance</div>
          <div className="stat-value" style={{fontSize:"26px",color:balance>=0?"var(--success)":"var(--danger)"}}>{formatCurrency(balance)}</div>
          <div className="stat-sub">Live balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today — Received</div>
          <div className="stat-value" style={{fontSize:"20px",color:"var(--success)"}}>{formatCurrency(todayIn)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Today — Paid Out</div>
          <div className="stat-value" style={{fontSize:"20px",color:"var(--danger)"}}>{formatCurrency(todayOut)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today — Net</div>
          <div className="stat-value" style={{fontSize:"20px",color:todayIn-todayOut>=0?"var(--success)":"var(--danger)"}}>{formatCurrency(todayIn-todayOut)}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:"20px"}}>
        <div className="card">
          <div className="section-title">Full Cash Ledger</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>In (৳)</th><th>Out (৳)</th><th>Balance</th><th></th></tr></thead>
              <tbody>
                {sorted.length===0&&<tr><td colSpan={7}><div className="empty-state"><p>No cash entries yet</p></div></td></tr>}
                {[...sorted].reverse().map(e=>(
                  <tr key={e.id}>
                    <td className="mono" style={{fontSize:"12px"}}>{e.date}</td>
                    <td><span style={{fontSize:"11px",color:TYPE_COLOR[e.type]||"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",fontWeight:600}}>{e.type}</span></td>
                    <td style={{fontSize:"13px"}}>{e.description}</td>
                    <td className="amount amount-positive">{e.direction==="in"?formatCurrency(e.amount):"—"}</td>
                    <td className="amount amount-negative">{e.direction==="out"?formatCurrency(e.amount):"—"}</td>
                    <td className="amount" style={{fontWeight:700,color:parseFloat(e.balance)>=0?"var(--success)":"var(--danger)"}}>{formatCurrency(e.balance)}</td>
                    <td><DeleteBtn onDelete={()=>deleteCashLedgerRow(e.id)} label="this cash entry"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div className="card">
            <div className="section-title">Summary</div>
            {[
              {label:"Total Cash Received",val:totalIn,color:"var(--success)"},
              {label:"Total Cash Paid Out",val:totalOut,color:"var(--danger)"},
              {label:"Net Position",val:totalIn-totalOut,color:(totalIn-totalOut)>=0?"var(--success)":"var(--danger)"},
            ].map(({label,val,color})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:"12px",color:"var(--text-muted)"}}>{label}</span>
                <span className="mono" style={{color,fontWeight:700,fontSize:"13px"}}>{formatCurrency(val)}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title">Today's Flow</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {todayEntries.length===0&&<p style={{color:"var(--text-muted)",fontSize:"13px"}}>No entries today</p>}
              {todayEntries.map(e=>(
                <div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"var(--bg-elevated)",borderRadius:"6px",borderLeft:`3px solid ${e.direction==="in"?"var(--success)":"var(--danger)"}`}}>
                  <span style={{fontSize:"12px"}}>{e.description.slice(0,28)}</span>
                  <span className="mono" style={{color:e.direction==="in"?"var(--success)":"var(--danger)",fontSize:"12px",fontWeight:600}}>
                    {e.direction==="in"?"+":"-"}{formatCurrency(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
