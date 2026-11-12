"use client";

import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  History,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useDeleteExpense,
  useDeleteExpenseEntry,
  useDeleteRepayment,
} from "@/features/expenses/hooks/use-expenses";
import { formatCurrency, type ExpenseDTO } from "@/features/expenses/types";

interface ExpenseCardProps {
  expense: ExpenseDTO;
  onRecordRepayment: (expense: ExpenseDTO) => void;
  onAddMoney: (expense: ExpenseDTO) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return (name.trim().slice(0, 2) || "EX").toUpperCase();
}

export function ExpenseCard({ expense, onRecordRepayment, onAddMoney }: ExpenseCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<"GIVEN" | "REPAID">("GIVEN");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteExpense = useDeleteExpense();
  const deleteExpenseEntry = useDeleteExpenseEntry();
  const deleteRepayment = useDeleteRepayment();

  const percentRepaid = Math.min(
    100,
    Math.round((expense.repaidAmount / (expense.amount || 1)) * 100),
  );

  const isFullyRepaid = expense.status === "FULLY_REPAID" || expense.remainingBalance <= 0.001;
  const isPartiallyRepaid = expense.status === "PARTIALLY_REPAID";

  const totalEntriesCount = expense.entries?.length ?? 1;
  const totalRepaymentsCount = expense.repayments?.length ?? 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/70 bg-card p-4 transition-all duration-150",
        "hover:border-border hover:shadow-xs",
        isFullyRepaid && "opacity-85 bg-card/60",
      )}
    >
      {/* ── Top Row: Person Info & Status Badge ───────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {getInitials(expense.personName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground text-sm tracking-tight">
                {expense.personName}
              </h4>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                {expense.type === "LENT" ? "Lent" : "Borrowed"}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {expense.date}
              </span>
              {expense.dueDate ? (
                <span>· Due {expense.dueDate}</span>
              ) : null}
              {totalEntriesCount > 1 ? (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                  {totalEntriesCount} loans
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isFullyRepaid ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              Fully Repaid
            </span>
          ) : isPartiallyRepaid ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <Clock className="h-3 w-3" />
              Partially Repaid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <Clock className="h-3 w-3" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* ── Optional Note ─────────────────────────────────────────── */}
      {expense.note ? (
        <p className="mt-2.5 rounded-lg bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground italic">
          &ldquo;{expense.note}&rdquo;
        </p>
      ) : null}

      {/* ── Financial Amounts & Progress ──────────────────────────── */}
      <div className="mt-3.5 space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-[11px] text-muted-foreground">Total Lent</p>
            <p className="mt-0.5 font-semibold text-foreground">
              {formatCurrency(expense.amount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total Repaid</p>
            <p className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(expense.repaidAmount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Outstanding</p>
            <p
              className={cn(
                "mt-0.5 font-bold",
                isFullyRepaid
                  ? "text-muted-foreground"
                  : "text-amber-600 dark:text-amber-400 text-sm",
              )}
            >
              {formatCurrency(expense.remainingBalance)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-300",
              isFullyRepaid ? "bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${percentRepaid}%` }}
          />
        </div>
      </div>

      {/* ── Bottom Actions & History Trigger ──────────────────────── */}
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
        {/* Toggle History */}
        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <History className="h-3.5 w-3.5" />
          <span>
            History ({totalEntriesCount + totalRepaymentsCount})
          </span>
          {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Add More Money to this Person */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAddMoney(expense)}
            title="Lend more money to this person"
            className="h-7 gap-1 px-2 text-xs font-medium shadow-none hover:bg-primary/10 hover:text-primary hover:border-primary/40"
          >
            <Plus className="h-3 w-3" />
            Add Money
          </Button>

          {/* Record Repayment against balance */}
          {!isFullyRepaid ? (
            <Button
              type="button"
              size="sm"
              onClick={() => onRecordRepayment(expense)}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium shadow-none"
            >
              <Coins className="h-3.5 w-3.5" />
              Repay
            </Button>
          ) : null}

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">Delete?</span>
              <button
                type="button"
                onClick={() => deleteExpense.mutate(expense.id)}
                className="rounded bg-destructive px-1.5 py-0.5 text-[11px] font-medium text-destructive-foreground hover:opacity-90"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-accent"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              title="Delete record"
              onClick={() => setConfirmDelete(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Expandable History Drawer (Lent Entries & Repayments) ──── */}
      {showHistory ? (
        <div className="mt-3 space-y-2.5 border-t border-border/50 pt-2.5">
          {/* Sub-tabs for History */}
          <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setHistoryTab("GIVEN")}
              className={cn(
                "flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                historyTab === "GIVEN"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Money Given ({totalEntriesCount})
            </button>
            <button
              type="button"
              onClick={() => setHistoryTab("REPAID")}
              className={cn(
                "flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                historyTab === "REPAID"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Repayments ({totalRepaymentsCount})
            </button>
          </div>

          {/* Tab 1: Money Given (Lending entries) */}
          {historyTab === "GIVEN" && (
            <div className="space-y-1.5">
              {expense.entries && expense.entries.length > 0 ? (
                expense.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(entry.amount)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{entry.date}</span>
                      </div>
                      {entry.note ? (
                        <p className="text-[11px] text-muted-foreground truncate">{entry.note}</p>
                      ) : null}
                    </div>
                    {/* Only show delete on entry if there are multiple entries */}
                    {expense.entries.length > 1 && !entry.id.endsWith("-initial") ? (
                      <button
                        type="button"
                        title="Delete this lending transaction"
                        onClick={() =>
                          deleteExpenseEntry.mutate({
                            expenseId: expense.id,
                            entryId: entry.id,
                          })
                        }
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground/70 italic">No lending history recorded.</p>
              )}
            </div>
          )}

          {/* Tab 2: Repayments */}
          {historyTab === "REPAID" && (
            <div className="space-y-1.5">
              {expense.repayments.length === 0 ? (
                <p className="text-xs text-muted-foreground/70 italic">No repayments recorded yet.</p>
              ) : (
                expense.repayments.map((repayment) => (
                  <div
                    key={repayment.id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(repayment.amount)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{repayment.date}</span>
                      </div>
                      {repayment.note ? (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {repayment.note}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      title="Delete repayment"
                      onClick={() =>
                        deleteRepayment.mutate({
                          expenseId: expense.id,
                          repaymentId: repayment.id,
                        })
                      }
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
