import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, exportCSV, monthLabel } from "../utils/sheets";

export default function Reports() {
  const { employees, salaryRecords, loans, bonuses, transactions, increments, incomeEntries, expenseEntries, cashLedger, bankLedger, cheques, deposits, motherTransfers, caps } = useApp();
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth()+1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const filterByDate = (records, dateKey="date") => {
    if (dateFilter==="all") return records;
    return records.filter(r=>{
      const d = r[dateKey]||"";
      if (dateFilter==="month") {
        if (r.month) return r.month===selectedMonth&&r.year===selectedYear;
        const dt = new Date(d);
        return dt.getMonth()+1===parseInt(selectedMonth)&&dt.getFullYear()===parseInt(selectedYear);
      }
      if (dateFilter==="year") {
        if (r.year) return r.year===selectedYear;
        return new Date(d).getFullYear()===parseInt(selectedYear);
      }
      return true;
    });
  };

  const fSal = filterByDate(salaryRecords);
  const fTxn = filterByDate(transactions);
  const fInc = filterByDate(incomeEntries);
  const fExp = filterByDate(expenseEntries);
  const fCash = filterByDate(cashLedger);
  const fBank = filterByDate(bankLedger);
  const fDep = filterByDate(deposits);
  const fMC = filterByDate(motherTransfers);

  const months12 = Array.from({length:12},(_,i)=>({value:String(i+1),label:new Date(2000,i,1).toLocaleString("default",{month:"long"})}));

  // Monthly profit summary
  const allMonths = [...new Set(salaryRecords.map(r=>`${r.year}-${r.month.padStart(2,"0")}`))].sort().reverse();
  const monthlySummary = allMonths.slice(0,6).map(ym=>{
    const [y,m] = ym.split("-");
    const mo = parseInt(m), yr = parseInt(y);
    const income = incomeEntries.filter(e=>new Date(e.date).getMonth()+1===mo&&new Date(e.date).getFullYear()===yr).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    const expense = expenseEntries.filter(e=>new Date(e.date).getMonth()+1===mo&&new Date(e.date).getFullYear()===yr).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    const salaries = salaryRecords.filter(r=>parseInt(r.month)===mo&&parseInt(r.year)===yr).reduce((s,r)=>s+(parseFloat(r.totalWithdrawn)||0),0);
    const mcSent = motherTransfers.filter(t=>new Date(t.date).getMonth()+1===mo&&new Date(t.date).getFullYear()===yr).reduce((s,t)=>s+(parseFloat(t.amount)||0),0);
    return { label:monthLabel(mo,yr), income, expense, salaries, mcSent, net:income-expense-salaries-mcSent };
  });

  const exportSets = [
    {label:"Employees CSV",icon:"👥",count:employees.length,fn:()=>exportCSV(employees.map(e=>({ID:e.id,Name:e.name,NID:e.nid,DOB:e.dob,"Joining Date":e.joiningDate,bKash:e.bkash,Salary:e.salary,Status:e.status,Designation:e.designation,Department:e.department})),`employees_${selectedYear}.csv`)},
    {label:"Salary Records CSV",icon:"💰",count:fSal.length,fn:()=>exportCSV(fSal.map(r=>({"Employee ID":r.employeeId,"Employee Name":r.employeeName,Month:r.month,Year:r.year,"Base Salary":r.baseSalary,Bonus:r.bonus,"Loan Deduction":r.loanDeduction,"Total Payable":r.totalPayable,"Withdrawn":r.totalWithdrawn,Balance:r.balance,Status:r.status})),`salary_${selectedYear}_${selectedMonth.padStart(2,"0")}.csv`)},
    {label:"Payment Transactions CSV",icon:"📋",count:fTxn.length,fn:()=>exportCSV(fTxn.map(t=>({"Employee":t.employeeName,Date:t.date,Amount:t.amount,Method:t.method,"Transaction ID":t.transactionId,"Sender Account":t.senderAccount,Note:t.note})),`transactions_${selectedYear}_${selectedMonth.padStart(2,"0")}.csv`)},
    {label:"Daily Income CSV",icon:"📈",count:fInc.length,fn:()=>exportCSV(fInc.map(e=>({Date:e.date,Customer:e.customerName,Amount:e.amount,Method:e.paymentMethod,"Transaction ID":e.transactionId,Category:e.category,Note:e.note})),`income_${selectedYear}_${selectedMonth.padStart(2,"0")}.csv`)},
    {label:"Daily Expenses CSV",icon:"📉",count:fExp.length,fn:()=>exportCSV(fExp.map(e=>({Date:e.date,Category:e.category,Amount:e.amount,"Payment Method":e.paymentMethod,Note:e.note})),`expenses_${selectedYear}_${selectedMonth.padStart(2,"0")}.csv`)},
    {label:"Cash Ledger CSV",icon:"💵",count:fCash.length,fn:()=>exportCSV(fCash.map(e=>({Date:e.date,Type:e.type,Description:e.description,Amount:e.amount,Direction:e.direction,Balance:e.balance})),`cash_ledger_${selectedYear}.csv`)},
    {label:"Bank Ledger CSV",icon:"🏦",count:fBank.length,fn:()=>exportCSV(fBank.map(e=>({Date:e.date,Type:e.type,Description:e.description,Amount:e.amount,Direction:e.direction,"TXN ID":e.transactionId,Balance:e.balance})),`bank_ledger_${selectedYear}.csv`)},
    {label:"Cheques CSV",icon:"📄",count:cheques.length,fn:()=>exportCSV(cheques.map(c=>({Customer:c.customerName,"Cheque #":c.chequeNumber,Bank:c.bankName,Amount:c.amount,"Issue Date":c.issueDate,"Received Date":c.receivedDate,"Clear Date":c.expectedClearDate,Status:c.status,Note:c.note})),`cheques_${selectedYear}.csv`)},
    {label:"Deposits CSV",icon:"⬇",count:fDep.length,fn:()=>exportCSV(fDep.map(d=>({Date:d.date,Amount:d.amount,Destination:d.destination,Reference:d.reference,Note:d.note})),`deposits_${selectedYear}.csv`)},
    {label:"Mother Company CSV",icon:"🌐",count:fMC.length,fn:()=>exportCSV(fMC.map(m=>({Date:m.date,Amount:m.amount,Method:m.method,Reference:m.reference,Note:m.note})),`mother_company_${selectedYear}.csv`)},
    {label:"Loans CSV",icon:"📦",count:loans.length,fn:()=>exportCSV(loans.map(l=>({Employee:l.employeeName,Amount:l.amount,"Issue Date":l.issueDate,"Repayment":l.repaymentType,"Monthly Ded.":l.monthlyDeduction,Deducted:l.totalDeducted,Remaining:l.remaining,Status:l.status})),`loans_${selectedYear}.csv`)},
  ];

  return (
    <div>
      <div className="page-header"><h2>Reports & Export</h2><p>Monthly summaries, profit analysis, and CSV export</p></div>

      {/* Date filter */}
      <div className="card" style={{marginBottom:"20px"}}>
        <div className="section-title">Date Filter for Export</div>
        <div style={{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
          {["all","month","year"].map(f=>(
            <label key={f} style={{display:"flex",alignItems:"center",gap:"6px",cursor:"pointer",fontSize:"13px"}}>
              <input type="radio" name="df" value={f} checked={dateFilter===f} onChange={()=>setDateFilter(f)}/>
              {f==="all"?"All Records":f==="month"?"Specific Month":"Full Year"}
            </label>
          ))}
          {dateFilter!=="all"&&<>
            {dateFilter==="month"&&<select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{width:"130px"}}>{months12.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}</select>}
            <input type="number" value={selectedYear} onChange={e=>setSelectedYear(e.target.value)} style={{width:"80px"}}/>
          </>}
        </div>
      </div>

      {/* Export grid */}
      <div className="card" style={{marginBottom:"20px"}}>
        <div className="section-title">Export CSV Files (UTF-8 encoded)</div>
        {!caps.canExport ? (
          <div className="alert alert-warning">CSV export is available to Admin and Manager roles only.</div>
        ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"10px"}}>
          {exportSets.map(({label,icon,count,fn})=>(
            <button key={label} onClick={fn} style={{background:"var(--bg-elevated)",border:"1px solid var(--border)",borderRadius:"10px",padding:"14px",cursor:"pointer",textAlign:"left",transition:"var(--transition)",color:"var(--text)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.background="var(--accent-dim)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="var(--bg-elevated)";}}>
              <div style={{fontSize:"20px",marginBottom:"6px"}}>{icon}</div>
              <div style={{fontWeight:600,fontSize:"12px",marginBottom:"2px"}}>{label}</div>
              <div style={{fontSize:"11px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{count} records</div>
              <div style={{marginTop:"6px",fontSize:"11px",color:"var(--accent)"}}>↓ Download</div>
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Monthly P&L Summary */}
      <div className="card" style={{marginBottom:"20px"}}>
        <div className="section-title">Monthly Branch Summary</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Salary Paid</th><th>Sent to HQ</th><th>Net Position</th></tr></thead>
            <tbody>
              {monthlySummary.length===0&&<tr><td colSpan={6}><div className="empty-state"><p>No data yet</p></div></td></tr>}
              {monthlySummary.map(m=>(
                <tr key={m.label}>
                  <td style={{fontWeight:500}}>{m.label}</td>
                  <td className="amount amount-positive">{formatCurrency(m.income)}</td>
                  <td className="amount amount-negative">{formatCurrency(m.expense)}</td>
                  <td className="amount" style={{color:"var(--warning)"}}>{formatCurrency(m.salaries)}</td>
                  <td className="amount" style={{color:"var(--text-muted)"}}>{formatCurrency(m.mcSent)}</td>
                  <td className="amount" style={{fontWeight:700,color:m.net>=0?"var(--success)":"var(--danger)"}}>{formatCurrency(m.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Increment history */}
      {increments.length>0&&(
        <div className="card">
          <div className="section-title">Salary Increment History</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Previous</th><th>Increment</th><th>New Salary</th><th>Effective Date</th><th>Notes</th></tr></thead>
              <tbody>
                {increments.map(i=>(
                  <tr key={i.id}>
                    <td style={{fontWeight:500}}>{i.employeeName}</td>
                    <td className="amount">{formatCurrency(i.previousSalary)}</td>
                    <td className="amount amount-positive">+{formatCurrency(i.incrementAmount)}</td>
                    <td className="amount" style={{fontWeight:700}}>{formatCurrency(i.newSalary)}</td>
                    <td className="mono" style={{fontSize:"12px"}}>{i.effectiveDate}</td>
                    <td style={{color:"var(--text-muted)",fontSize:"12px"}}>{i.notes||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
