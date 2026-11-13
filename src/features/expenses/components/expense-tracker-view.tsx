"use client";

import { HandCoins, Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useExpenses,
  useExpenseStats,
} from "@/features/expenses/hooks/use-expenses";
import { ExpenseStats } from "@/features/expenses/components/expense-stats";
import { ExpenseCard } from "@/features/expenses/components/expense-card";
import { ExpenseDialog } from "@/features/expenses/components/expense-dialog";
import { RepaymentDialog } from "@/features/expenses/components/repayment-dialog";
import { AddEntryDialog } from "@/features/expenses/components/add-entry-dialog";
import type { ExpenseDTO, RepaymentStatus } from "@/features/expenses/types";

type FilterTab = "ALL" | RepaymentStatus;

const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "PARTIALLY_REPAID", label: "Partially Repaid" },
  { key: "FULLY_REPAID", label: "Fully Repaid" },
];

export function ExpenseTrackerView() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [repayingExpense, setRepayingExpense] = useState<ExpenseDTO | null>(null);
  const [addingMoneyExpense, setAddingMoneyExpense] = useState<ExpenseDTO | null>(null);

  const filterStatus = activeTab === "ALL" ? undefined : activeTab;
  const { data: expenses, isLoading, isError } = useExpenses({
    status: filterStatus,
    search: searchQuery || undefined,
  });

  const { data: stats, isLoading: isStatsLoading } = useExpenseStats();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Expense Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track money lent to others, add multiple loans per person, and record repayments.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Record Money Lent
        </Button>
      </div>

      {/* ── Summary Stats ──────────────────────────────────────────── */}
      <ExpenseStats stats={stats} isLoading={isStatsLoading} />

      {/* ── Filter Bar & Search ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border p-1 bg-muted/20">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by person or note..."
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* ── Transactions List / Grid ───────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-border/60 bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-dashed border-destructive/40 p-12 text-center text-sm text-destructive">
          Failed to load expense records. Please refresh the page.
        </div>
      ) : expenses && expenses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onRecordRepayment={setRepayingExpense}
              onAddMoney={setAddingMoneyExpense}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <HandCoins className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">
            No transactions found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery || activeTab !== "ALL"
              ? "No transactions match your current search or filter."
              : "Keep track of money you lend to friends, family, or colleagues."}
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="mt-4 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Record your first transaction
          </Button>
        </div>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
      <ExpenseDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <RepaymentDialog
        expense={repayingExpense}
        onClose={() => setRepayingExpense(null)}
      />

      <AddEntryDialog
        expense={addingMoneyExpense}
        onClose={() => setAddingMoneyExpense(null)}
      />
    </div>
  );
}
