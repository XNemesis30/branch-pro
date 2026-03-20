import { useApp } from "../context/AppContext";
import { formatCurrency, monthLabel } from "../utils/sheets";

export default function Dashboard() {
  const { getStats, salaryRecords, employees, loans, incomeEntries, expenseEntries, cheques, motherTransfers, isDemo, setCurrentPage, error, setError, caps, role } = useApp();
  const stats = getStats();

  const now = new Date();
  const curMonth = now.getMonth()+1, curYear = now.getFullYear();
  const monthIncome = incomeEntries.filter(e=>new Date(e.date).getMonth()+1===curMonth&&new Date(e.date).getFullYear()===curYear).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const monthExpense = expenseEntries.filter(e=>new Date(e.date).getMonth()+1===curMonth&&new Date(e.date).getFullYear()===curYear).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  const monthSalary = salaryRecords.filter(r=>parseInt(r.month)===curMonth&&parseInt(r.year)===curYear).reduce((s,r)=>s+(parseFloat(r.totalWithdrawn)||0),0);
  const monthMC = motherTransfers.filter(m=>new Date(m.date).getMonth()+1===curMonth&&new Date(m.date).getFullYear()===curYear).reduce((s,m)=>s+(parseFloat(m.amount)||0),0);
  const netPosition = monthIncome - monthExpense - monthSalary - monthMC;

  const pendingCheques = cheques.filter(c=>c.status==="pending");
  const unpaidEmployees = employees.filter(emp=>{
    const latest = salaryRecords.filter(r=>r.employeeId===emp.id).sort((a,b)=>(parseInt(b.year)*12+parseInt(b.month))-(parseInt(a.year)*12+parseInt(a.month)))[0];
    return latest&&parseFloat(latest.balance)>0;
  });
  const activeLoans = loans.filter(l=>l.status==="active");

  return (
    <div>
      <div className="page-header">
        <h2>Branch Financial Dashboard</h2>
        <p>{monthLabel(curMonth,curYear)} overview{isDemo?" — Demo Mode":""}</p>
      </div>

      {isDemo&&<div className="alert alert-warning" style={{marginBottom:"24px"}}>📊 Demo mode — configure Google Sheets API in <span className="mono">.env</span> to save real data.</div>}

      {error&&(
        <div className="alert alert-error" style={{marginBottom:"24px",lineHeight:"1.7"}}>
          <strong>⚠ Setup issue detected:</strong><br/>{error}
          <button onClick={()=>setError(null)} style={{float:"right",background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:"16px",marginTop:"-2px"}}>✕</button>
        </div>
      )}

      {/* Asset summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"16px",marginBottom:"20px"}}>
        <div style={{background:"linear-gradient(135deg,var(--success)15,var(--success)05)",border:"1px solid var(--success)30",borderRadius:"var(--radius)",padding:"20px",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:"11px",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"1px",color:"var(--success)",marginBottom:"6px"}}>Cash on Hand</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"32px",fontWeight:"800",color:"var(--success)",letterSpacing:"-1px"}}>{formatCurrency(stats.cashBalance)}</div>
          <div style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"4px"}}>Physical cash in branch</div>
          <div style={{position:"absolute",right:"-10px",bottom:"-10px",fontSize:"60px",opacity:"0.05"}}>💵</div>
        </div>
        <div style={{background:"linear-gradient(135deg,var(--accent)15,var(--accent)05)",border:"1px solid var(--accent)30",borderRadius:"var(--radius)",padding:"20px",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:"11px",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"1px",color:"var(--accent)",marginBottom:"6px"}}>Bank Balance</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"32px",fontWeight:"800",color:"var(--accent)",letterSpacing:"-1px"}}>{formatCurrency(stats.bankBalance)}</div>
          <div style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"4px"}}>In bank account</div>
          <div style={{position:"absolute",right:"-10px",bottom:"-10px",fontSize:"60px",opacity:"0.05"}}>🏦</div>
        </div>
      </div>

      {/* This month summary */}
      <div className="card" style={{marginBottom:"20px"}}>
        <div className="section-title">This Month — {monthLabel(curMonth,curYear)}</div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${caps.canViewPayroll ? 5 : 3},1fr)`,gap:"12px"}}>
          {[
            {label:"Income",val:monthIncome,color:"var(--success)",page:"income"},
            {label:"Expenses",val:monthExpense,color:"var(--danger)",page:"expenses"},
            ...(caps.canViewPayroll ? [{label:"Salary Paid",val:monthSalary,color:"var(--warning)",page:"salary"}] : []),
            {label:"Sent to HQ",val:monthMC,color:"var(--text-muted)",page:"mothercompany"},
            {label:"Net Position",val:netPosition,color:netPosition>=0?"var(--success)":"var(--danger)"},
          ].map(({label,val,color,page})=>(
            <div key={label} style={{background:"var(--bg-elevated)",borderRadius:"10px",padding:"14px",cursor:page?"pointer":"default",transition:"var(--transition)"}}
              onClick={()=>page&&setCurrentPage(page)}
              onMouseEnter={e=>page&&(e.currentTarget.style.borderColor="var(--accent)")}
              onMouseLeave={e=>page&&(e.currentTarget.style.borderColor="")}>
              <div style={{fontSize:"10px",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.8px",color:"var(--text-muted)",marginBottom:"6px"}}>{label}</div>
              <div className="mono" style={{fontSize:"18px",fontWeight:700,color}}>{formatCurrency(val)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
        {/* Key metrics */}
        <div className="stat-grid" style={{gridTemplateColumns:"1fr 1fr",margin:0}}>
          {caps.canViewPayroll && <div className="stat-card"><div className="stat-label">Active Employees</div><div className="stat-value">{stats.activeEmployees}</div><div className="stat-sub">of {stats.totalEmployees} total</div></div>}
          {caps.canViewPayroll && <div className="stat-card warning"><div className="stat-label">Pending Salary</div><div className="stat-value" style={{fontSize:"20px"}}>{formatCurrency(stats.totalPendingLiability)}</div></div>}
          {caps.canViewPayroll && <div className="stat-card danger"><div className="stat-label">Loan Outstanding</div><div className="stat-value" style={{fontSize:"20px"}}>{formatCurrency(stats.totalLoanOutstanding)}</div></div>}
          <div className="stat-card"><div className="stat-label">Cash Balance</div><div className="stat-value" style={{fontSize:"20px"}}>{formatCurrency(stats.cashBalance)}</div></div>
          <div className="stat-card success"><div className="stat-label">Bank Balance</div><div className="stat-value" style={{fontSize:"20px"}}>{formatCurrency(stats.bankBalance)}</div></div>
          <div className="stat-card"><div className="stat-label">Pending Cheques</div><div className="stat-value">{pendingCheques.length}</div><div className="stat-sub">{formatCurrency(stats.pendingCheques)}</div></div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="section-title">⚠ Attention Required</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {caps.canViewPayroll && unpaidEmployees.length>0&&(
              <div style={{padding:"10px 12px",background:"var(--warning-dim)",borderRadius:"8px",borderLeft:"3px solid var(--warning)",cursor:"pointer"}} onClick={()=>setCurrentPage("salary")}>
                <div style={{fontWeight:600,fontSize:"13px",color:"var(--warning)"}}>{unpaidEmployees.length} employee(s) with unpaid salary</div>
                <div style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"2px"}}>{formatCurrency(stats.totalPendingLiability)} outstanding</div>
              </div>
            )}
            {pendingCheques.length>0&&(
              <div style={{padding:"10px 12px",background:"var(--accent-dim)",borderRadius:"8px",borderLeft:"3px solid var(--accent)",cursor:"pointer"}} onClick={()=>setCurrentPage("cheques")}>
                <div style={{fontWeight:600,fontSize:"13px",color:"var(--accent)"}}>{pendingCheques.length} cheque(s) pending clearance</div>
                <div style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"2px"}}>{formatCurrency(stats.pendingCheques)} receivable</div>
              </div>
            )}
            {caps.canViewPayroll && activeLoans.length>0&&(
              <div style={{padding:"10px 12px",background:"var(--danger-dim)",borderRadius:"8px",borderLeft:"3px solid var(--danger)",cursor:"pointer"}} onClick={()=>setCurrentPage("loans")}>
                <div style={{fontWeight:600,fontSize:"13px",color:"var(--danger)"}}>{activeLoans.length} active loan(s)</div>
                <div style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"2px"}}>{formatCurrency(stats.totalLoanOutstanding)} remaining</div>
              </div>
            )}
            {(!caps.canViewPayroll || unpaidEmployees.length===0) && pendingCheques.length===0 && (!caps.canViewPayroll || activeLoans.length===0)&&(
              <div style={{textAlign:"center",padding:"20px",color:"var(--text-muted)"}}>✓ All clear — no urgent items</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent income */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
            <div className="section-title" style={{marginBottom:0,paddingBottom:0,border:"none"}}>Recent Income</div>
            <button className="btn btn-secondary btn-sm" onClick={()=>setCurrentPage("income")}>View All</button>
          </div>
          {[...incomeEntries].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4).map(e=>(
            <div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <div>
                <div style={{fontWeight:500,fontSize:"13px"}}>{e.customerName}</div>
                <div style={{fontSize:"11px",color:"var(--text-muted)"}}>{e.date} · {e.paymentMethod}</div>
              </div>
              <span className="amount amount-positive" style={{fontWeight:700}}>{formatCurrency(e.amount)}</span>
            </div>
          ))}
          {incomeEntries.length===0&&<p style={{color:"var(--text-muted)",fontSize:"13px",textAlign:"center",padding:"16px 0"}}>No income entries yet</p>}
        </div>

        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
            <div className="section-title" style={{marginBottom:0,paddingBottom:0,border:"none"}}>Recent Expenses</div>
            <button className="btn btn-secondary btn-sm" onClick={()=>setCurrentPage("expenses")}>View All</button>
          </div>
          {[...expenseEntries].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4).map(e=>(
            <div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <div>
                <div style={{fontWeight:500,fontSize:"13px",textTransform:"capitalize"}}>{e.category}</div>
                <div style={{fontSize:"11px",color:"var(--text-muted)"}}>{e.date} · {e.note||"—"}</div>
              </div>
              <span className="amount amount-negative" style={{fontWeight:700}}>{formatCurrency(e.amount)}</span>
            </div>
          ))}
          {expenseEntries.length===0&&<p style={{color:"var(--text-muted)",fontSize:"13px",textAlign:"center",padding:"16px 0"}}>No expense entries yet</p>}
        </div>
      </div>
    </div>
  );
}
