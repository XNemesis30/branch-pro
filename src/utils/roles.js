// ─── Role definitions ────────────────────────────────────────
export const ROLES = {
  ADMIN:    "admin",
  MANAGER:  "manager",
  EMPLOYEE: "employee",
};

// Pages each role can see in the sidebar
export const ROLE_PAGES = {
  admin: [
    "dashboard","employees","salary","loans","bonuses",
    "income","expenses","cash","bank","cheques","deposits","mothercompany","reports",
  ],
  manager: [
    "dashboard","employees","salary","loans","bonuses",
    "income","expenses","cash","bank","cheques","deposits","mothercompany","reports",
  ],
  employee: [
    "dashboard","income","expenses","cash","bank","cheques","deposits","mothercompany",
  ],
};

// Fine-grained capability flags per role
export const ROLE_CAPS = {
  admin: {
    canEditEmployees:  true,
    canFireRehire:     true,
    canApplyIncrement: true,
    canIssueLoan:      true,
    canRepayLoan:      true,
    canAddBonus:       true,
    canGenerateSalary: true,
    canRecordPayment:  true,
    canViewPayroll:    true,
    canExport:         true,
    canAddIncome:      true,
    canAddExpense:     true,
    canAddDeposit:     true,
    canAddCheque:      true,
    canUpdateCheque:   true,
    canAddMCTransfer:  true,
    canDelete:         true,   // ← admin only
  },
  manager: {
    canEditEmployees:  false,
    canFireRehire:     true,
    canApplyIncrement: false,
    canIssueLoan:      false,
    canRepayLoan:      false,
    canAddBonus:       false,
    canGenerateSalary: false,
    canRecordPayment:  false,
    canViewPayroll:    true,
    canExport:         true,
    canAddIncome:      true,
    canAddExpense:     true,
    canAddDeposit:     true,
    canAddCheque:      true,
    canUpdateCheque:   true,
    canAddMCTransfer:  true,
    canDelete:         false,
  },
  employee: {
    canEditEmployees:  false,
    canFireRehire:     false,
    canApplyIncrement: false,
    canIssueLoan:      false,
    canRepayLoan:      false,
    canAddBonus:       false,
    canGenerateSalary: false,
    canRecordPayment:  false,
    canViewPayroll:    false,
    canExport:         false,
    canAddIncome:      true,
    canAddExpense:     true,
    canAddDeposit:     true,
    canAddCheque:      true,
    canUpdateCheque:   true,
    canAddMCTransfer:  true,
    canDelete:         false,
  },
};

export function getCaps(role) {
  return ROLE_CAPS[role] || ROLE_CAPS.employee;
}

export function getPages(role) {
  return ROLE_PAGES[role] || ROLE_PAGES.employee;
}

export const ROLE_LABELS = {
  admin:    "Admin",
  manager:  "Manager",
  employee: "Staff",
};

export const ROLE_COLORS = {
  admin:    "var(--accent)",
  manager:  "var(--success)",
  employee: "var(--warning)",
};
