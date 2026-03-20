import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/sheets";

const TYPE_COLOR = { income:"var(--success)", expense:"var(--danger)", salary:"var(--warning)", deposit:"var(--accent)", cheque:"var(--success)", "cheque recovery":"var(--success)" };

export default function BankLedger() {
  const { bankLedger, getBankBalance } = useApp();
  const sorted = [...bankLedger].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const balance = getBankBalance();

  const totalIn = sorted.filter(e=>e.direction==="in").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const totalOut = sorted.filter(e=>e.direction==="out").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);

  const today = new Date().toISOString().split("T")[0];
  const todayIn = sorted.filter(e=>e.date===today&&e.direction==="in").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const todayOut = sorted.filter(e=>e.date===today&&e.direction==="out").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);

  return (
    <div>
      <div className="page-header"><h2>Bank Ledger</h2><p>All bank account transactions — completely separate from cash</p></div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"24px"}}>
        <div className="stat-card success">
          <div className="stat-label">Bank Balance</div>
          <div className="stat-value" style={{fontSize:"26px"}}>{formatCurrency(balance)}</div>
          <div className="stat-sub">Current balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today — In</div>
          <div className="stat-value" style={{fontSize:"20px",color:"var(--success)"}}>{formatCurrency(todayIn)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Today — Out</div>
          <div className="stat-value" style={{fontSize:"20px",color:"var(--danger)"}}>{formatCurrency(todayOut)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">All Time In</div>
          <div className="stat-value" style={{fontSize:"20px",color:"var(--accent)"}}>{formatCurrency(totalIn)}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:"20px"}}>
        <div className="card">
          <div className="section-title">Bank Transaction History</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Credit (৳)</th><th>Debit (৳)</th><th>Balance</th><th>Ref / TXN ID</th></tr></thead>
              <tbody>
                {sorted.length===0&&<tr><td colSpan={7}><div className="empty-state"><p>No bank entries yet</p></div></td></tr>}
                {[...sorted].reverse().map(e=>(
                  <tr key={e.id}>
                    <td className="mono" style={{fontSize:"12px"}}>{e.date}</td>
                    <td><span style={{fontSize:"11px",color:TYPE_COLOR[e.type]||"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",fontWeight:600}}>{e.type}</span></td>
                    <td style={{fontSize:"13px"}}>{e.description}</td>
                    <td className="amount amount-positive">{e.direction==="in"?formatCurrency(e.amount):"—"}</td>
                    <td className="amount amount-negative">{e.direction==="out"?formatCurrency(e.amount):"—"}</td>
                    <td className="amount" style={{fontWeight:700,color:parseFloat(e.balance)>=0?"var(--success)":"var(--danger)"}}>{formatCurrency(e.balance)}</td>
                    <td className="mono" style={{fontSize:"11px",color:"var(--accent)"}}>{e.transactionId||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div className="card">
            <div className="section-title">Bank Summary</div>
            {[
              {label:"Total Credits",val:totalIn,color:"var(--success)"},
              {label:"Total Debits",val:totalOut,color:"var(--danger)"},
              {label:"Net Balance",val:balance,color:balance>=0?"var(--success)":"var(--danger)"},
            ].map(({label,val,color})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:"12px",color:"var(--text-muted)"}}>{label}</span>
                <span className="mono" style={{color,fontWeight:700,fontSize:"13px"}}>{formatCurrency(val)}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{background:"var(--accent-dim)",border:"1px solid var(--accent)30"}}>
            <div style={{fontSize:"11px",color:"var(--accent)",fontFamily:"var(--font-mono)",textTransform:"uppercase",marginBottom:"6px"}}>Important Note</div>
            <p style={{fontSize:"12px",color:"var(--text-dim)",lineHeight:"1.7"}}>
              Bank balance updates automatically when:<br/>
              • Customer bank transfers received<br/>
              • Cash deposited to bank<br/>
              • Cheques cleared<br/>
              • Salary paid via bank<br/>
              • Expenses paid by bank
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
