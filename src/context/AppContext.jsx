import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  readSheet, appendRow, updateRow, SHEETS,
  EMPLOYEE_HEADERS, SALARY_HEADERS, LOAN_HEADERS, BONUS_HEADERS,
  TRANSACTION_HEADERS, INCREMENT_HEADERS, INCOME_HEADERS, EXPENSE_HEADERS,
  CASH_HEADERS, BANK_HEADERS, CHEQUE_HEADERS, DEPOSIT_HEADERS, MOTHER_HEADERS,
  generateId, generateEmployeeId, setAccessToken, initializeSheets,
  SHEETS_CONFIG, today,
} from "../utils/sheets";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loans, setLoans] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [increments, setIncrements] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [cashLedger, setCashLedger] = useState([]);
  const [bankLedger, setBankLedger] = useState([]);
  const [cheques, setCheques] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [motherTransfers, setMotherTransfers] = useState([]);

  const isDemo = !SHEETS_CONFIG.SPREADSHEET_ID;

  const login = useCallback(async (password) => {
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
    if (password !== adminPass) throw new Error("Invalid password");
    if (!SHEETS_CONFIG.CLIENT_ID) { setIsLoggedIn(true); return; }
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: SHEETS_CONFIG.CLIENT_ID,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        callback: async (response) => {
          if (response.error) { reject(new Error(response.error)); return; }
          setAccessToken(response.access_token);
          setIsLoggedIn(true);
          await loadAllData();
          resolve();
        },
      });
      client.requestAccessToken();
    });
  }, []);

  const logout = () => { setIsLoggedIn(false); setAccessToken(null); setCurrentPage("dashboard"); };

  const loadAllData = useCallback(async () => {
    if (!SHEETS_CONFIG.SPREADSHEET_ID) return;
    setLoading(true);
    try {
      await initializeSheets();
      const [emps,sal,ln,bon,txn,inc,income,exp,cash,bank,cheq,dep,mom] = await Promise.all([
        readSheet(SHEETS.EMPLOYEES), readSheet(SHEETS.SALARY), readSheet(SHEETS.LOANS),
        readSheet(SHEETS.BONUSES), readSheet(SHEETS.TRANSACTIONS), readSheet(SHEETS.INCREMENTS),
        readSheet(SHEETS.INCOME), readSheet(SHEETS.EXPENSES), readSheet(SHEETS.CASH_LEDGER),
        readSheet(SHEETS.BANK_LEDGER), readSheet(SHEETS.CHEQUES), readSheet(SHEETS.DEPOSITS),
        readSheet(SHEETS.MOTHER_COMPANY),
      ]);
      setEmployees(emps); setSalaryRecords(sal); setLoans(ln); setBonuses(bon);
      setTransactions(txn); setIncrements(inc); setIncomeEntries(income);
      setExpenseEntries(exp); setCashLedger(cash); setBankLedger(bank);
      setCheques(cheq); setDeposits(dep); setMotherTransfers(mom);
    } catch(e) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isLoggedIn && isDemo) loadDemoData(); }, [isLoggedIn]);

  const loadDemoData = () => {
    setEmployees([
      {id:"EMP-0001",name:"Rahman Ahmed",nid:"1234567890",dob:"1990-05-15",joiningDate:"2022-01-01",bkash:"01711111111",salary:"25000",status:"Active",designation:"Developer",department:"Tech",createdAt:"2022-01-01"},
      {id:"EMP-0002",name:"Fatema Khatun",nid:"0987654321",dob:"1993-08-22",joiningDate:"2022-03-15",bkash:"01722222222",salary:"18000",status:"Active",designation:"Designer",department:"Creative",createdAt:"2022-03-15"},
      {id:"EMP-0003",name:"Karim Uddin",nid:"1122334455",dob:"1988-11-30",joiningDate:"2021-06-01",bkash:"01733333333",salary:"30000",status:"Active",designation:"Manager",department:"Operations",createdAt:"2021-06-01"},
    ]);
    setSalaryRecords([
      {id:"SAL-001",employeeId:"EMP-0001",employeeName:"Rahman Ahmed",month:"3",year:"2026",baseSalary:"25000",bonus:"2000",incrementAdjusted:"25000",loanDeduction:"0",totalPayable:"27000",totalWithdrawn:"20000",balance:"7000",status:"partial"},
      {id:"SAL-002",employeeId:"EMP-0002",employeeName:"Fatema Khatun",month:"3",year:"2026",baseSalary:"18000",bonus:"0",incrementAdjusted:"18000",loanDeduction:"2000",totalPayable:"16000",totalWithdrawn:"16000",balance:"0",status:"paid"},
      {id:"SAL-003",employeeId:"EMP-0003",employeeName:"Karim Uddin",month:"3",year:"2026",baseSalary:"30000",bonus:"5000",incrementAdjusted:"30000",loanDeduction:"0",totalPayable:"35000",totalWithdrawn:"0",balance:"35000",status:"unpaid"},
    ]);
    setLoans([{id:"LOAN-001",employeeId:"EMP-0002",employeeName:"Fatema Khatun",amount:"20000",issueDate:"2026-01-15",repaymentType:"monthly",monthlyDeduction:"2000",totalDeducted:"4000",remaining:"16000",status:"active"}]);
    setBonuses([
      {id:"BON-001",employeeId:"EMP-0001",employeeName:"Rahman Ahmed",amount:"2000",date:"2026-03-01",reason:"Performance Bonus",type:"one-time"},
      {id:"BON-002",employeeId:"EMP-0003",employeeName:"Karim Uddin",amount:"5000",date:"2026-03-01",reason:"Eid Bonus",type:"one-time"},
    ]);
    setTransactions([
      {id:"TXN-001",employeeId:"EMP-0001",employeeName:"Rahman Ahmed",salaryRecordId:"SAL-001",date:"2026-03-05",amount:"20000",method:"bKash",transactionId:"BK123456789",senderAccount:"01700000000"},
      {id:"TXN-002",employeeId:"EMP-0002",employeeName:"Fatema Khatun",salaryRecordId:"SAL-002",date:"2026-03-07",amount:"16000",method:"Nagad",transactionId:"NG987654321",senderAccount:"01700000000"},
    ]);
    setIncomeEntries([
      {id:"INC-001",date:"2026-03-18",customerName:"Akbar Trading",amount:"50000",paymentMethod:"bKash",transactionId:"BK555111222",senderAccount:"01811111111",category:"product sale",note:"March order"},
      {id:"INC-002",date:"2026-03-19",customerName:"Rahim Stores",amount:"15000",paymentMethod:"Cash",transactionId:"",senderAccount:"",category:"due payment",note:"Old balance"},
      {id:"INC-003",date:"2026-03-20",customerName:"Nadia Enterprises",amount:"30000",paymentMethod:"Bank Transfer",transactionId:"DBB20260320",senderAccount:"1234567890",category:"advance payment",note:"April advance"},
    ]);
    setExpenseEntries([
      {id:"EXP-001",date:"2026-03-18",category:"transport",amount:"800",paymentMethod:"Cash",note:"Delivery charge"},
      {id:"EXP-002",date:"2026-03-19",category:"electricity",amount:"3500",paymentMethod:"Bank",note:"March bill"},
      {id:"EXP-003",date:"2026-03-20",category:"office supplies",amount:"1200",paymentMethod:"Cash",note:"Stationery"},
    ]);
    setCashLedger([
      {id:"CASH-001",date:"2026-03-18",type:"income",description:"Rahim Stores - Cash",amount:"15000",direction:"in",reference:"INC-002",balance:"65000"},
      {id:"CASH-002",date:"2026-03-18",type:"expense",description:"Transport",amount:"800",direction:"out",reference:"EXP-001",balance:"64200"},
      {id:"CASH-003",date:"2026-03-20",type:"expense",description:"Office supplies",amount:"1200",direction:"out",reference:"EXP-003",balance:"63000"},
    ]);
    setBankLedger([
      {id:"BANK-001",date:"2026-03-18",type:"income",description:"Akbar Trading - bKash",amount:"50000",direction:"in",transactionId:"BK555111222",balance:"150000"},
      {id:"BANK-002",date:"2026-03-19",type:"expense",description:"Electricity bill",amount:"3500",direction:"out",transactionId:"DBB-EXP-001",balance:"146500"},
      {id:"BANK-003",date:"2026-03-20",type:"income",description:"Nadia Enterprises - Bank Transfer",amount:"30000",direction:"in",transactionId:"DBB20260320",balance:"176500"},
    ]);
    setCheques([
      {id:"CHQ-001",customerName:"Masud Corporation",chequeNumber:"CHQ-123456",bankName:"Dutch-Bangla Bank",amount:"45000",issueDate:"2026-03-10",receivedDate:"2026-03-12",expectedClearDate:"2026-03-25",status:"pending",note:""},
      {id:"CHQ-002",customerName:"Hasan Brothers",chequeNumber:"CHQ-789012",bankName:"BRAC Bank",amount:"20000",issueDate:"2026-03-01",receivedDate:"2026-03-05",expectedClearDate:"2026-03-15",status:"cleared",note:"On time"},
    ]);
    setDeposits([
      {id:"DEP-001",date:"2026-03-15",amount:"30000",destination:"Bank",reference:"DEP-REF-001",note:"Weekly deposit"},
      {id:"DEP-002",date:"2026-03-10",amount:"20000",destination:"Mother Company",reference:"MC-REF-001",note:"Head office transfer"},
    ]);
    setMotherTransfers([
      {id:"MC-001",date:"2026-03-10",amount:"20000",method:"bKash",reference:"MC-BK-001",note:"Weekly remittance"},
    ]);
  };

  const getCashBalance = () => {
    if (!cashLedger.length) return 0;
    const last = [...cashLedger].sort((a,b) => new Date(b.date)-new Date(a.date))[0];
    return parseFloat(last.balance)||0;
  };
  const getBankBalance = () => {
    if (!bankLedger.length) return 0;
    const last = [...bankLedger].sort((a,b) => new Date(b.date)-new Date(a.date))[0];
    return parseFloat(last.balance)||0;
  };

  const _addCashEntry = async (entry) => {
    const cur = getCashBalance();
    const amt = parseFloat(entry.amount);
    const newBal = entry.direction==="in" ? cur+amt : cur-amt;
    const row = {...entry, id:generateId("CASH"), balance:String(newBal)};
    if (!isDemo) await appendRow(SHEETS.CASH_LEDGER, row, CASH_HEADERS);
    setCashLedger(prev => [...prev, row]);
    return row;
  };
  const _addBankEntry = async (entry) => {
    const cur = getBankBalance();
    const amt = parseFloat(entry.amount);
    const newBal = entry.direction==="in" ? cur+amt : cur-amt;
    const row = {...entry, id:generateId("BANK"), balance:String(newBal)};
    if (!isDemo) await appendRow(SHEETS.BANK_LEDGER, row, BANK_HEADERS);
    setBankLedger(prev => [...prev, row]);
    return row;
  };

  const addIncome = async (entry) => {
    const isCash = entry.paymentMethod==="Cash";
    if (!isCash && !entry.transactionId) throw new Error("Transaction ID is required for non-cash payments.");
    if (entry.transactionId && incomeEntries.find(e=>e.transactionId===entry.transactionId)) throw new Error("Duplicate transaction ID detected.");
    const row = {...entry, id:generateId("INC")};
    if (!isDemo) await appendRow(SHEETS.INCOME, row, INCOME_HEADERS);
    setIncomeEntries(prev => [...prev, row]);
    if (isCash) await _addCashEntry({date:entry.date,type:"income",description:`${entry.customerName} - Cash`,amount:entry.amount,direction:"in",reference:row.id});
    else await _addBankEntry({date:entry.date,type:"income",description:`${entry.customerName} - ${entry.paymentMethod}`,amount:entry.amount,direction:"in",transactionId:entry.transactionId});
    return row;
  };

  const addExpense = async (entry) => {
    const row = {...entry, id:generateId("EXP")};
    if (!isDemo) await appendRow(SHEETS.EXPENSES, row, EXPENSE_HEADERS);
    setExpenseEntries(prev => [...prev, row]);
    if (entry.paymentMethod==="Cash") await _addCashEntry({date:entry.date,type:"expense",description:`${entry.category}: ${entry.note}`,amount:entry.amount,direction:"out",reference:row.id});
    else await _addBankEntry({date:entry.date,type:"expense",description:`${entry.category}: ${entry.note}`,amount:entry.amount,direction:"out",transactionId:""});
    return row;
  };

  const addDeposit = async (entry) => {
    const row = {...entry, id:generateId("DEP")};
    if (!isDemo) await appendRow(SHEETS.DEPOSITS, row, DEPOSIT_HEADERS);
    setDeposits(prev => [...prev, row]);
    await _addCashEntry({date:entry.date,type:"deposit",description:`Deposit to ${entry.destination}`,amount:entry.amount,direction:"out",reference:row.id});
    if (entry.destination==="Bank") await _addBankEntry({date:entry.date,type:"deposit",description:"Cash deposit received",amount:entry.amount,direction:"in",transactionId:entry.reference});
    return row;
  };

  const addMotherTransfer = async (entry) => {
    const row = {...entry, id:generateId("MC")};
    if (!isDemo) await appendRow(SHEETS.MOTHER_COMPANY, row, MOTHER_HEADERS);
    setMotherTransfers(prev => [...prev, row]);
    await _addCashEntry({date:entry.date,type:"transfer",description:"Sent to Mother Company",amount:entry.amount,direction:"out",reference:row.id});
    return row;
  };

  const addCheque = async (cheque) => {
    const row = {...cheque, id:generateId("CHQ"), status:"pending"};
    if (!isDemo) await appendRow(SHEETS.CHEQUES, row, CHEQUE_HEADERS);
    setCheques(prev => [...prev, row]);
    return row;
  };

  const updateChequeStatus = async (id, newStatus, note="") => {
    const idx = cheques.findIndex(c=>c.id===id);
    if (idx===-1) return;
    const cheque = cheques[idx];
    const updated = {...cheque, status:newStatus, note};
    if (!isDemo) await updateRow(SHEETS.CHEQUES, idx, updated, CHEQUE_HEADERS);
    setCheques(prev => prev.map(c=>c.id===id ? updated : c));
    if (newStatus==="cleared") await _addBankEntry({date:today(),type:"cheque",description:`Cheque cleared - ${cheque.customerName} #${cheque.chequeNumber}`,amount:cheque.amount,direction:"in",transactionId:cheque.chequeNumber});
    return updated;
  };

  const collectBouncedCheque = async (id, {method, amount, txnId}) => {
    const idx = cheques.findIndex(c=>c.id===id);
    if (idx===-1) return;
    const cheque = cheques[idx];
    const updated = {...cheque, status:"manually collected", note:`Collected via ${method}`};
    if (!isDemo) await updateRow(SHEETS.CHEQUES, idx, updated, CHEQUE_HEADERS);
    setCheques(prev => prev.map(c=>c.id===id ? updated : c));
    if (method==="Cash") await _addCashEntry({date:today(),type:"cheque recovery",description:`Cheque recovery - ${cheque.customerName}`,amount,direction:"in",reference:id});
    else await _addBankEntry({date:today(),type:"cheque recovery",description:`Cheque recovery - ${cheque.customerName}`,amount,direction:"in",transactionId:txnId});
  };

  const addEmployee = async (emp) => {
    const newEmp = {...emp, id:generateEmployeeId(employees), status:"Active", createdAt:today()};
    if (!isDemo) await appendRow(SHEETS.EMPLOYEES, newEmp, EMPLOYEE_HEADERS);
    setEmployees(prev => [...prev, newEmp]);
    return newEmp;
  };
  const updateEmployee = async (id, updates) => {
    const idx = employees.findIndex(e=>e.id===id);
    if (idx===-1) return;
    const updated = {...employees[idx], ...updates};
    if (!isDemo) await updateRow(SHEETS.EMPLOYEES, idx, updated, EMPLOYEE_HEADERS);
    setEmployees(prev => prev.map(e=>e.id===id ? updated : e));
  };
  const fireEmployee = async (id) => updateEmployee(id, {status:"Fired", fireDate:today()});
  const rehireEmployee = async (id, newSalary) => updateEmployee(id, {status:"Rehired", rehireDate:today(), salary:newSalary});

  const generateSalaryRecord = async (employeeId, month, year) => {
    const emp = employees.find(e=>e.id===employeeId);
    if (!emp) return;
    const pm = month===1?12:month-1, py = month===1?year-1:year;
    const prev = salaryRecords.find(s=>s.employeeId===employeeId&&parseInt(s.month)===pm&&parseInt(s.year)===py);
    const carryForward = prev ? parseFloat(prev.balance)||0 : 0;
    const activeLoan = loans.find(l=>l.employeeId===employeeId&&l.status==="active");
    const loanDed = activeLoan ? parseFloat(activeLoan.monthlyDeduction)||0 : 0;
    const monthBon = bonuses.filter(b=>b.employeeId===employeeId&&new Date(b.date).getMonth()+1===month&&new Date(b.date).getFullYear()===year);
    const bonusTotal = monthBon.reduce((s,b)=>s+(parseFloat(b.amount)||0),0);
    const base = parseFloat(emp.salary)||0;
    const total = base+bonusTotal+carryForward-loanDed;
    const record = {id:generateId("SAL"),employeeId,employeeName:emp.name,month:String(month),year:String(year),baseSalary:String(base),bonus:String(bonusTotal),incrementAdjusted:String(base),loanDeduction:String(loanDed),totalPayable:String(total),totalWithdrawn:"0",balance:String(total),status:"unpaid",createdAt:today()};
    if (!isDemo) await appendRow(SHEETS.SALARY, record, SALARY_HEADERS);
    setSalaryRecords(prev=>[...prev,record]);
    if (activeLoan&&loanDed>0) {
      const lIdx = loans.findIndex(l=>l.id===activeLoan.id);
      const nd = parseFloat(activeLoan.totalDeducted||0)+loanDed;
      const nr = parseFloat(activeLoan.remaining)-loanDed;
      const ul = {...activeLoan, totalDeducted:String(nd), remaining:String(Math.max(0,nr)), status:nr<=0?"completed":"active"};
      if (!isDemo) await updateRow(SHEETS.LOANS, lIdx, ul, LOAN_HEADERS);
      setLoans(prev=>prev.map(l=>l.id===activeLoan.id?ul:l));
    }
    return record;
  };

  const recordPayment = async (salaryRecordId, {amount,method,transactionId,senderAccount,date,note}) => {
    if (transactionId&&method!=="Cash") {
      if (transactions.find(t=>t.transactionId===transactionId)) throw new Error("Duplicate transaction ID blocked.");
    }
    const record = salaryRecords.find(s=>s.id===salaryRecordId);
    if (!record) throw new Error("Salary record not found");
    const payAmt = parseFloat(amount);
    const nw = (parseFloat(record.totalWithdrawn)||0)+payAmt;
    const nb = (parseFloat(record.totalPayable)||0)-nw;
    const st = nb<=0?"paid":"partial";
    const idx = salaryRecords.findIndex(s=>s.id===salaryRecordId);
    const ur = {...record, totalWithdrawn:String(nw), balance:String(Math.max(0,nb)), status:st};
    if (!isDemo) await updateRow(SHEETS.SALARY, idx, ur, SALARY_HEADERS);
    setSalaryRecords(prev=>prev.map(s=>s.id===salaryRecordId?ur:s));
    const txn = {id:generateId("TXN"),employeeId:record.employeeId,employeeName:record.employeeName,salaryRecordId,date:date||today(),amount:String(payAmt),method,transactionId:transactionId||"",senderAccount:senderAccount||"",note:note||""};
    if (!isDemo) await appendRow(SHEETS.TRANSACTIONS, txn, TRANSACTION_HEADERS);
    setTransactions(prev=>[...prev,txn]);
    if (method==="Cash") await _addCashEntry({date:date||today(),type:"salary",description:`Salary - ${record.employeeName}`,amount:String(payAmt),direction:"out",reference:txn.id});
    else await _addBankEntry({date:date||today(),type:"salary",description:`Salary - ${record.employeeName}`,amount:String(payAmt),direction:"out",transactionId});
    return txn;
  };

  const issueLoan = async (loan) => {
    const emp = employees.find(e=>e.id===loan.employeeId);
    const nl = {...loan,id:generateId("LOAN"),employeeName:emp?.name||"",totalDeducted:"0",remaining:loan.amount,status:"active"};
    if (!isDemo) await appendRow(SHEETS.LOANS, nl, LOAN_HEADERS);
    setLoans(prev=>[...prev,nl]);
    await _addCashEntry({date:loan.issueDate||today(),type:"loan",description:`Loan issued - ${emp?.name}`,amount:loan.amount,direction:"out",reference:nl.id});
    return nl;
  };
  const repayLoanFull = async (loanId) => {
    const idx = loans.findIndex(l=>l.id===loanId);
    if (idx===-1) return;
    const ul = {...loans[idx],totalDeducted:loans[idx].amount,remaining:"0",status:"completed"};
    if (!isDemo) await updateRow(SHEETS.LOANS, idx, ul, LOAN_HEADERS);
    setLoans(prev=>prev.map(l=>l.id===loanId?ul:l));
  };
  const addBonus = async (bonus) => {
    const emp = employees.find(e=>e.id===bonus.employeeId);
    const nb = {...bonus,id:generateId("BON"),employeeName:emp?.name||""};
    if (!isDemo) await appendRow(SHEETS.BONUSES, nb, BONUS_HEADERS);
    setBonuses(prev=>[...prev,nb]);
    return nb;
  };
  const applyIncrement = async ({employeeId,incrementAmount,effectiveDate,notes}) => {
    const emp = employees.find(e=>e.id===employeeId);
    if (!emp) return;
    const ps = parseFloat(emp.salary), ns = ps+parseFloat(incrementAmount);
    const inc = {id:generateId("INC"),employeeId,employeeName:emp.name,previousSalary:String(ps),incrementAmount:String(incrementAmount),newSalary:String(ns),effectiveDate,notes:notes||""};
    if (!isDemo) await appendRow(SHEETS.INCREMENTS, inc, INCREMENT_HEADERS);
    setIncrements(prev=>[...prev,inc]);
    await updateEmployee(employeeId,{salary:String(ns)});
    return inc;
  };

  const getStats = () => {
    const active = employees.filter(e=>e.status==="Active"||e.status==="Rehired");
    return {
      totalEmployees: employees.length, activeEmployees: active.length,
      totalSalaryExpense: salaryRecords.reduce((s,r)=>s+(parseFloat(r.totalWithdrawn)||0),0),
      totalPendingLiability: salaryRecords.reduce((s,r)=>s+(parseFloat(r.balance)||0),0),
      totalLoanOutstanding: loans.filter(l=>l.status==="active").reduce((s,l)=>s+(parseFloat(l.remaining)||0),0),
      totalBonuses: bonuses.reduce((s,b)=>s+(parseFloat(b.amount)||0),0),
      totalIncome: incomeEntries.reduce((s,e)=>s+(parseFloat(e.amount)||0),0),
      totalExpenses: expenseEntries.reduce((s,e)=>s+(parseFloat(e.amount)||0),0),
      cashBalance: getCashBalance(), bankBalance: getBankBalance(),
      pendingCheques: cheques.filter(c=>c.status==="pending").reduce((s,c)=>s+(parseFloat(c.amount)||0),0),
      totalMotherSent: motherTransfers.reduce((s,m)=>s+(parseFloat(m.amount)||0),0),
    };
  };

  return (
    <AppContext.Provider value={{
      isLoggedIn,login,logout,currentPage,setCurrentPage,loading,error,setError,isDemo,
      employees,salaryRecords,loans,bonuses,transactions,increments,
      incomeEntries,expenseEntries,cashLedger,bankLedger,cheques,deposits,motherTransfers,
      addEmployee,updateEmployee,fireEmployee,rehireEmployee,
      generateSalaryRecord,recordPayment,issueLoan,repayLoanFull,addBonus,applyIncrement,
      addIncome,addExpense,addDeposit,addMotherTransfer,
      addCheque,updateChequeStatus,collectBouncedCheque,
      getCashBalance,getBankBalance,getStats,loadAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}
