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
  MOBILE_LEDGER: "MobileLedger",
  CHEQUES: "Cheques",
  DEPOSITS: "Deposits",
  MOTHER_COMPANY: "MotherCompany",
};

let accessToken = null;
export function setAccessToken(t) { accessToken = t; }
export function getAccessToken() { return accessToken; }
function authHeaders() {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

// ── Read sheet rows as objects ─────────────────────────────
export async function readSheet(sheetName) {
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${SHEETS_CONFIG.API_KEY}`;
  const opts = accessToken ? { headers: authHeaders() } : {};
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to read ${sheetName}: ${res.status}`);
  }
  const data = await res.json();
  const rows = data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const o = {};
    headers.forEach((h, i) => { o[h] = row[i] ?? ""; });
    return o;
  });
}

// ── Append a new row ──────────────────────────────────────
export async function appendRow(sheetName, rowObj, headers) {
  if (!accessToken) throw new Error("Not authenticated. Please log in again.");
  const values = [headers.map(h => String(rowObj[h] ?? ""))];
  const range = encodeURIComponent(sheetName) + "!A1";
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ values }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `${res.status} ${res.statusText}`;
    throw new Error(`Cannot save to "${sheetName}": ${msg}. Make sure the sheet tab exists and you have edit access.`);
  }
  return res.json();
}

// ── Update an existing row by index ──────────────────────
export async function updateRow(sheetName, rowIndex, rowObj, headers) {
  if (!accessToken) throw new Error("Not authenticated. Please log in again.");
  const sheetRow = rowIndex + 2; // +1 for header, +1 for 1-based
  const values = [headers.map(h => String(rowObj[h] ?? ""))];
  const range = encodeURIComponent(sheetName) + `!A${sheetRow}`;
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ values }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `${res.status} ${res.statusText}`;
    throw new Error(`Cannot update "${sheetName}" row ${sheetRow}: ${msg}`);
  }
  return res.json();
}

// ── Get sheetId (numeric) for a named tab — needed for delete ─
export async function getSheetId(sheetName) {
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}?fields=sheets.properties`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Could not fetch spreadsheet metadata");
  const data = await res.json();
  const sheet = (data.sheets || []).find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet tab "${sheetName}" not found`);
  return sheet.properties.sheetId;
}

// ── Delete a row by index (0-based data row, so actual row = index+2) ─
export async function deleteRow(sheetName, rowIndex) {
  if (!accessToken) throw new Error("Not authenticated. Please log in again.");
  const sheetId = await getSheetId(sheetName);
  const startIndex = rowIndex + 1; // +1 to skip header row (0-based in batchUpdate)
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}:batchUpdate`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex,
            endIndex: startIndex + 1,
          },
        },
      }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `${res.status} ${res.statusText}`;
    throw new Error(`Cannot delete row from "${sheetName}": ${msg}`);
  }
  return res.json();
}

export async function writeHeaders(sheetName, headers) {
  if (!accessToken) return;
  const range = encodeURIComponent(sheetName) + "!A1";
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ values: [headers] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.warn(`Could not write headers to ${sheetName}:`, err?.error?.message);
  }
}

// ── Get list of existing sheet tabs ──────────────────────
export async function getSheetTabs() {
  if (!accessToken) return [];
  const url = `${BASE}/${SHEETS_CONFIG.SPREADSHEET_ID}?fields=sheets.properties.title`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.sheets || []).map(s => s.properties.title);
}

// ── Initialize all tabs (write headers if first row empty) 
export async function initializeSheets() {
  const allSheets = [
    { name: SHEETS.EMPLOYEES,     headers: EMPLOYEE_HEADERS },
    { name: SHEETS.SALARY,        headers: SALARY_HEADERS },
    { name: SHEETS.LOANS,         headers: LOAN_HEADERS },
    { name: SHEETS.BONUSES,       headers: BONUS_HEADERS },
    { name: SHEETS.TRANSACTIONS,  headers: TRANSACTION_HEADERS },
    { name: SHEETS.INCREMENTS,    headers: INCREMENT_HEADERS },
    { name: SHEETS.INCOME,        headers: INCOME_HEADERS },
    { name: SHEETS.EXPENSES,      headers: EXPENSE_HEADERS },
    { name: SHEETS.CASH_LEDGER,   headers: CASH_HEADERS },
    { name: SHEETS.BANK_LEDGER,   headers: BANK_HEADERS },
    { name: SHEETS.MOBILE_LEDGER, headers: MOBILE_HEADERS },
    { name: SHEETS.CHEQUES,       headers: CHEQUE_HEADERS },
    { name: SHEETS.DEPOSITS,      headers: DEPOSIT_HEADERS },
    { name: SHEETS.MOTHER_COMPANY,headers: MOTHER_HEADERS },
  ];

  // Get existing tabs so we can warn about missing ones
  const existingTabs = await getSheetTabs();
  const missing = allSheets.map(s => s.name).filter(n => !existingTabs.includes(n));
  if (missing.length > 0) {
    console.warn("Missing sheet tabs:", missing.join(", "));
  }

  for (const sheet of allSheets) {
    if (!existingTabs.includes(sheet.name)) continue; // skip missing tabs silently
    try {
      const rows = await readSheet(sheet.name);
      if (rows.length === 0) {
        await writeHeaders(sheet.name, sheet.headers);
      }
    } catch (e) {
      console.warn(`Could not init ${sheet.name}:`, e.message);
    }
  }

  return { missing };
}

// ── Headers for each sheet ────────────────────────────────
export const EMPLOYEE_HEADERS    = ["id","name","nid","dob","joiningDate","bkash","salary","status","designation","department","address","emergencyContact","fireDate","rehireDate","createdAt"];
export const SALARY_HEADERS      = ["id","employeeId","employeeName","month","year","baseSalary","bonus","incrementAdjusted","loanDeduction","totalPayable","totalWithdrawn","balance","status","createdAt"];
export const LOAN_HEADERS        = ["id","employeeId","employeeName","amount","loanType","issueDate","repaymentType","monthlyDeduction","totalDeducted","remaining","status","notes"];
export const BONUS_HEADERS       = ["id","employeeId","employeeName","amount","date","reason","type"];
export const TRANSACTION_HEADERS = ["id","employeeId","employeeName","salaryRecordId","date","amount","method","transactionId","senderAccount","note"];
export const INCREMENT_HEADERS   = ["id","employeeId","employeeName","previousSalary","incrementAmount","newSalary","effectiveDate","notes"];
export const INCOME_HEADERS      = ["id","date","customerName","amount","paymentMethod","transactionId","senderAccount","category","note"];
export const EXPENSE_HEADERS     = ["id","date","category","amount","paymentMethod","note"];
export const CASH_HEADERS        = ["id","date","type","description","amount","direction","reference","balance"];
export const BANK_HEADERS        = ["id","date","type","description","amount","direction","transactionId","reference","balance"];
export const MOBILE_HEADERS      = ["id","date","type","description","amount","direction","method","transactionId","reference","balance"];
export const CHEQUE_HEADERS      = ["id","customerName","chequeNumber","bankName","amount","issueDate","receivedDate","expectedClearDate","status","note"];
export const DEPOSIT_HEADERS     = ["id","date","amount","destination","method","reference","note"];
export const MOTHER_HEADERS      = ["id","date","amount","method","reference","note"];

// ── Utility helpers ───────────────────────────────────────
export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}
export function generateEmployeeId(existing) {
  const nums = existing.map(e => parseInt(e.id?.replace("EMP-","") || "0")).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `EMP-${String(next).padStart(4,"0")}`;
}
export function formatCurrency(amount) {
  const n = parseFloat(amount) || 0;
  return `৳${n.toLocaleString("en-BD")}`;
}
export function monthLabel(month, year) {
  return new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}
export function today() {
  return new Date().toISOString().split("T")[0];
}
export function exportCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${String(row[h]||"").replace(/"/g,'""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
