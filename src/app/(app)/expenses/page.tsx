import type { Metadata } from "next";

import { ExpenseTrackerView } from "@/features/expenses/components/expense-tracker-view";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track money lent, record repayments, and view outstanding balances.",
};

export default function ExpensesPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <ExpenseTrackerView />
    </div>
  );
}
