export const SHEETS_CONFIG = {
  SPREADSHEET_ID: import.meta.env.VITE_SPREADSHEET_ID || "",
  API_KEY: import.meta.env.VITE_SHEETS_API_KEY || "",
  CLIENT_ID: import.meta.env.VITE_CLIENT_ID || "",
};

const BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export const SHEETS = {
  EMPLOYEES: "Employees",
  SALARY: "SalaryRecords",
  LOANS: "Loans",
  BONUSES: "Bonuses",
  TRANSACTIONS: "Transactions",
  INCREMENTS: "Increments",
  INCOME: "Income",
  EXPENSES: "Expenses",
  CASH_LEDGER: "CashLedger",
  BANK_LEDGER: "BankLedger",
  CHEQUES: "Cheques",
  DEPOSITS: "Deposits",
  MOTHER_COMPANY: "MotherCompany",
};

let accessToken = null;
export function setAccessToken(t) { accessToken = t; }
export function getAccessToken() { return accessToken; }
function authHeaders() { return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }; }

export async function readSheet(sheetName) {
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${sheetName}?key=${SHEETS_CONFIG.API_KEY}`;
  const res = await fetch(url, accessToken ? { headers: authHeaders() } : {});
  if (!res.ok) throw new Error(`Failed to read ${sheetName}: ${res.statusText}`);
  const data = await res.json();
  const rows = data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => { const o = {}; headers.forEach((h,i) => o[h] = row[i] || ""); return o; });
}

export async function appendRow(sheetName, rowObj, headers) {
  const values = [headers.map(h => rowObj[h] ?? "")];
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, { method: "POST", headers: authHeaders(), body: JSON.stringify({ values }) });
  if (!res.ok) throw new Error(`Failed to append to ${sheetName}`);
  return res.json();
}

export async function updateRow(sheetName, rowIndex, rowObj, headers) {
  const sheetRow = rowIndex + 2;
  const values = [headers.map(h => rowObj[h] ?? "")];
  const range = `${sheetName}!A${sheetRow}`;
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ values }) });
  if (!res.ok) throw new Error(`Failed to update ${sheetName}`);
  return res.json();
}

export const EMPLOYEE_HEADERS = ["id","name","nid","dob","joiningDate","bkash","salary","status","designation","department","address","emergencyContact","fireDate","rehireDate","createdAt"];
export const SALARY_HEADERS = ["id","employeeId","employeeName","month","year","baseSalary","bonus","incrementAdjusted","loanDeduction","totalPayable","totalWithdrawn","balance","status","createdAt"];
export const LOAN_HEADERS = ["id","employeeId","employeeName","amount","issueDate","repaymentType","monthlyDeduction","totalDeducted","remaining","status","notes"];
export const BONUS_HEADERS = ["id","employeeId","employeeName","amount","date","reason","type"];
export const TRANSACTION_HEADERS = ["id","employeeId","employeeName","salaryRecordId","date","amount","method","transactionId","senderAccount","note"];
export const INCREMENT_HEADERS = ["id","employeeId","employeeName","previousSalary","incrementAmount","newSalary","effectiveDate","notes"];
export const INCOME_HEADERS = ["id","date","customerName","amount","paymentMethod","transactionId","senderAccount","category","note"];
export const EXPENSE_HEADERS = ["id","date","category","amount","paymentMethod","note"];
export const CASH_HEADERS = ["id","date","type","description","amount","direction","reference","balance"];
export const BANK_HEADERS = ["id","date","type","description","amount","direction","transactionId","balance"];
export const CHEQUE_HEADERS = ["id","customerName","chequeNumber","bankName","amount","issueDate","receivedDate","expectedClearDate","status","note"];
export const DEPOSIT_HEADERS = ["id","date","amount","destination","reference","note"];
export const MOTHER_HEADERS = ["id","date","amount","method","reference","note"];

export async function initializeSheets() {
  const allSheets = [
    { name: SHEETS.EMPLOYEES, headers: EMPLOYEE_HEADERS },
    { name: SHEETS.SALARY, headers: SALARY_HEADERS },
    { name: SHEETS.LOANS, headers: LOAN_HEADERS },
    { name: SHEETS.BONUSES, headers: BONUS_HEADERS },
    { name: SHEETS.TRANSACTIONS, headers: TRANSACTION_HEADERS },
    { name: SHEETS.INCREMENTS, headers: INCREMENT_HEADERS },
    { name: SHEETS.INCOME, headers: INCOME_HEADERS },
    { name: SHEETS.EXPENSES, headers: EXPENSE_HEADERS },
    { name: SHEETS.CASH_LEDGER, headers: CASH_HEADERS },
    { name: SHEETS.BANK_LEDGER, headers: BANK_HEADERS },
    { name: SHEETS.CHEQUES, headers: CHEQUE_HEADERS },
    { name: SHEETS.DEPOSITS, headers: DEPOSIT_HEADERS },
    { name: SHEETS.MOTHER_COMPANY, headers: MOTHER_HEADERS },
  ];
  for (const sheet of allSheets) {
    try {
      const rows = await readSheet(sheet.name);
      if (rows.length === 0) {
        const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${sheet.name}!A1?valueInputOption=USER_ENTERED`;
        await fetch(url, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ values: [sheet.headers] }) });
      }
    } catch(e) { console.warn(`Could not init sheet ${sheet.name}:`, e.message); }
  }
}

export function generateId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; }
export function generateEmployeeId(existing) {
  const nums = existing.map(e => parseInt(e.id?.replace("EMP-","") || "0")).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `EMP-${String(next).padStart(4,"0")}`;
}
export function formatCurrency(amount) { const n = parseFloat(amount)||0; return `৳${n.toLocaleString("en-BD")}`; }
export function currentMonthYear() { const now = new Date(); return { month: now.getMonth()+1, year: now.getFullYear(), label: now.toLocaleString("default",{month:"long",year:"numeric"}) }; }
export function monthLabel(month,year) { return new Date(year,month-1,1).toLocaleString("default",{month:"long",year:"numeric"}); }
export function today() { return new Date().toISOString().split("T")[0]; }

export function exportCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${String(row[h]||"").replace(/"/g,'""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF"+csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}
