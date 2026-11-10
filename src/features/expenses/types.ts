export type TransactionType = "LENT" | "BORROWED" | "EXPENSE";

export type RepaymentStatus = "PENDING" | "PARTIALLY_REPAID" | "FULLY_REPAID";

export interface ExpenseEntryDTO {
  id: string;
  expenseId: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepaymentDTO {
  id: string;
  expenseId: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseDTO {
  id: string;
  userId: string;
  personName: string;
  type: TransactionType;
  amount: number; // Total amount lent/given across all entries
  date: string; // Date of initial or latest entry
  dueDate: string | null;
  note: string | null;
  status: RepaymentStatus;
  repaidAmount: number;
  remainingBalance: number;
  entries: ExpenseEntryDTO[]; // All lending transactions for this person
  repayments: RepaymentDTO[]; // All repayments made by this person
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStatsDTO {
  totalLent: number;
  totalRecovered: number;
  totalOutstanding: number;
  activeDebtorsCount: number;
  totalTransactionsCount: number;
  fullyRepaidCount: number;
}

/** Formats currency amounts with ₹ (Indian Rupee) */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return `₹${formatted}`;
}
