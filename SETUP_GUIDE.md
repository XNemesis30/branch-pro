# Branch Pro — Complete Setup Guide

## What You're Getting

A full **Branch Finance & Payroll Management PWA** with:

### Payroll Modules
- Employee registration, firing, rehiring, increments
- Monthly salary generation with carry-forward
- Loan tracking with automatic monthly deductions
- Bonus management
- Payment recording with mandatory Transaction ID

### Finance Modules
- Daily income / customer payment recording
- Daily expense tracking with custom categories
- Live **Cash Ledger** — all physical cash tracked automatically
- Live **Bank Ledger** — all bank transactions tracked automatically
- **Cheque management** — pending → cleared / bounced → manual collect
- Cash deposit tracking (to bank or mother company)
- Mother company remittance ledger

### Reporting
- Unified financial dashboard with net branch position
- Monthly P&L summary
- 11 separate CSV exports (all UTF-8 for Bengali names)

---

## STEP 1 — Create Google Sheets Database

### 1.1 Create the Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** → rename to `Branch Pro Database`
3. Create **13 tabs** with these **exact names** (right-click tab → rename):

| Tab Name | Purpose |
|---|---|
| `Employees` | Employee records |
| `SalaryRecords` | Monthly salary records |
| `Loans` | Loan records |
| `Bonuses` | Bonus records |
| `Transactions` | Salary payment transactions |
| `Increments` | Salary increment history |
| `Income` | Daily customer income |
| `Expenses` | Daily branch expenses |
| `CashLedger` | All cash movements |
| `BankLedger` | All bank transactions |
| `Cheques` | Cheque tracking |
| `Deposits` | Cash deposit records |
| `MotherCompany` | Head office transfers |

4. Copy your **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

---

## STEP 2 — Google Cloud Setup (Free)

### 2.1 Create a Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click project dropdown → **New Project** → name it `Branch Pro` → Create
3. Make sure your new project is selected

### 2.2 Enable Google Sheets API
1. Left menu → **APIs & Services** → **Library**
2. Search **Google Sheets API** → Click it → **Enable**

### 2.3 Create an API Key (for reading data)
1. **APIs & Services** → **Credentials** → **+ Create Credentials** → **API Key**
2. Copy it — this is your `VITE_SHEETS_API_KEY`
3. Click **Edit API Key** → restrict to **Google Sheets API** only → Save

### 2.4 Create OAuth 2.0 Client ID (for writing data)
1. **+ Create Credentials** → **OAuth client ID**
2. If prompted → configure consent screen → **External** → fill in app name → Save
3. Back to Credentials → **+ Create Credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Under **Authorized JavaScript origins** add:
   - `http://localhost:5173`
   - Your Netlify URL (add after deploy, e.g. `https://your-app.netlify.app`)
6. Click **Create** → copy the **Client ID** → this is your `VITE_CLIENT_ID`

### 2.5 Share Your Spreadsheet
1. Open the Google Sheet → Click **Share**
2. Add email addresses of your higher-ups / accountant
3. Set permission to **Viewer** (read-only) or **Editor**
4. Click Send — they can now see all data live in Google Sheets

---

## STEP 3 — Configure the App

```bash
# Copy the env template
cp .env.example .env
```

Open `.env` and fill in all values:

```env
VITE_ADMIN_PASSWORD=your_secure_password
VITE_SPREADSHEET_ID=your_spreadsheet_id
VITE_SHEETS_API_KEY=your_api_key
VITE_CLIENT_ID=your_oauth_client_id
```

---

## STEP 4 — Run Locally

Requires [Node.js](https://nodejs.org) installed.

```bash
cd branch-pro
npm install
npm run dev
```

Open: **http://localhost:5173**
Password: whatever you set in `.env` (default: `admin123`)

---

## STEP 5 — Deploy Free on Netlify

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/branch-pro.git
git push -u origin main
```

> ⚠️ Make sure `.env` is in `.gitignore` — it already is by default

### Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from GitHub**
2. Select your repo
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**

### Add Environment Variables in Netlify
1. **Site configuration** → **Environment variables**
2. Add all 4 variables from your `.env`
3. **Trigger redeploy**

### Update OAuth Origins
1. Back in Google Cloud → **Credentials** → edit your OAuth Client ID
2. Add your Netlify URL to **Authorized JavaScript origins**
3. Save

---

## STEP 6 — Share With Higher-Ups

**Option A — App access:**
- Share the Netlify URL + password
- They log in and see all modules

**Option B — Google Sheets direct:**
- Share the spreadsheet directly
- All data updates live as you enter it
- They see it in familiar spreadsheet format

---

## How the Ledgers Work (Important)

Every entry automatically updates the correct ledger:

| Action | Cash | Bank |
|---|---|---|
| Customer pays cash | ✅ Cash +  | — |
| Customer bank/bKash transfer | — | ✅ Bank + |
| Expense paid cash | ✅ Cash − | — |
| Expense paid by bank | — | ✅ Bank − |
| Salary paid cash | ✅ Cash − | — |
| Salary paid by bank | — | ✅ Bank − |
| Loan issued (cash) | ✅ Cash − | — |
| Cash deposited to bank | ✅ Cash − | ✅ Bank + |
| Cash sent to mother co. | ✅ Cash − | — |
| Cheque cleared | — | ✅ Bank + |

**You never need to manually update ledgers** — it all happens automatically.

---

## Transaction ID Rules

| Payment Method | Transaction ID |
|---|---|
| bKash, Nagad, Rocket | **Mandatory** |
| Bank Transfer | **Mandatory** |
| Card Payment | **Mandatory** |
| Cash | Optional note |

Duplicate transaction IDs are **blocked system-wide**.

---

## Google Sheet Tab Reference

After setup, your Google Sheet will have these 13 tabs auto-populated with headers:

```
Employees · SalaryRecords · Loans · Bonuses · Transactions · Increments
Income · Expenses · CashLedger · BankLedger · Cheques · Deposits · MotherCompany
```

The app writes the headers automatically on first login when Sheets is configured.

---

## Cost Breakdown

| Service | Cost |
|---|---|
| Google Sheets (database) | **Free** |
| Google Cloud (API + OAuth) | **Free** |
| GitHub (private repo) | **Free** |
| Netlify (hosting) | **Free** |
| **Total** | **৳0 / month** |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| App shows "Demo Mode" | `VITE_SPREADSHEET_ID` is empty in `.env` |
| OAuth popup doesn't appear | Your domain not in Authorized Origins |
| Data not saving | Check OAuth token — try logging out and back in |
| Bengali names show `?` in CSV | Open in Google Sheets or use Excel import with UTF-8 |
| "Duplicate transaction ID" | That TXN ID already exists in the system |
| Cash balance seems wrong | Check CashLedger tab in Google Sheets for the last balance row |

---

## File Structure

```
branch-pro/
├── src/
│   ├── context/AppContext.jsx     ← All state & business logic
│   ├── utils/sheets.js            ← Google Sheets API layer
│   ├── components/Sidebar.jsx     ← Navigation
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx          ← Unified financial dashboard
│       ├── Employees.jsx
│       ├── Salary.jsx
│       ├── Loans.jsx
│       ├── Bonuses.jsx
│       ├── Income.jsx             ← Daily customer income
│       ├── Expenses.jsx           ← Daily branch expenses
│       ├── CashLedger.jsx         ← Live cash tracking
│       ├── BankLedger.jsx         ← Live bank tracking
│       ├── Cheques.jsx            ← Cheque lifecycle
│       ├── Deposits.jsx           ← Cash deposits
│       ├── MotherCompany.jsx      ← Head office transfers
│       └── Reports.jsx            ← 11 CSV exports + P&L
├── public/manifest.json           ← PWA manifest
├── .env.example                   ← Config template
├── .gitignore                     ← .env excluded
├── index.html
├── package.json
└── vite.config.js
```

---

## Multi-User Role System

Branch Pro supports 3 roles, each with its own password set in `.env`:

| Role | Password env var | Default |
|---|---|---|
| Admin | `VITE_ADMIN_PASSWORD` | `admin123` |
| Manager | `VITE_MANAGER_PASSWORD` | `manager123` |
| Staff/Employee | `VITE_EMPLOYEE_PASSWORD` | `staff123` |

### What each role can do

| Feature | Admin | Manager | Staff |
|---|---|---|---|
| Dashboard (finance view) | ✅ | ✅ | ✅ |
| Dashboard (payroll stats) | ✅ | ✅ | ❌ |
| Daily Income | ✅ | ✅ | ✅ |
| Daily Expenses | ✅ | ✅ | ✅ |
| Cash Ledger | ✅ | ✅ | ✅ |
| Bank Ledger | ✅ | ✅ | ✅ |
| Cheques | ✅ | ✅ | ✅ |
| Deposits | ✅ | ✅ | ✅ |
| Mother Company | ✅ | ✅ | ✅ |
| View Employees | ✅ | ✅ (view only) | ❌ |
| Add/Edit Employees | ✅ | ❌ | ❌ |
| Fire / Rehire | ✅ | ✅ | ❌ |
| Apply Increment | ✅ | ❌ | ❌ |
| View Salary Records | ✅ | ✅ | ❌ |
| Generate Salary | ✅ | ❌ | ❌ |
| Record Salary Payment | ✅ | ❌ | ❌ |
| View Loans | ✅ | ✅ | ❌ |
| Issue Loan | ✅ | ❌ | ❌ |
| Add Bonus | ✅ | ❌ | ❌ |
| Reports & CSV Export | ✅ | ✅ | ❌ |

### How to share access
- Give your admin password only to yourself (the owner)
- Give the manager password to your accountant or branch manager
- Give the staff password to any other employees who record daily transactions
- All 3 can be logged in simultaneously from different devices — Google Sheets handles concurrent access

### Changing passwords
Edit your `.env` file (or Netlify environment variables) and redeploy:
```env
VITE_ADMIN_PASSWORD=MySecureAdminPass2026
VITE_MANAGER_PASSWORD=MyManagerPass2026
VITE_EMPLOYEE_PASSWORD=MyStaffPass2026
```
