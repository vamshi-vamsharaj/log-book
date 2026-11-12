"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localDateKey } from "@/lib/period";
import { useAddRepayment } from "@/features/expenses/hooks/use-expenses";
import { formatCurrency, type ExpenseDTO } from "@/features/expenses/types";

interface RepaymentDialogProps {
  expense: ExpenseDTO | null;
  onClose: () => void;
}

export function RepaymentDialog({ expense, onClose }: RepaymentDialogProps) {
  const today = localDateKey();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  const addRepayment = useAddRepayment();

  useEffect(() => {
    if (expense) {
      // Default to remaining balance so full repayment is 1 click away
      setAmount(String(expense.remainingBalance));
      setDate(today);
      setNote("");
    }
  }, [expense, today]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expense) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    try {
      await addRepayment.mutateAsync({
        expenseId: expense.id,
        data: {
          amount: numAmount,
          date: date || today,
          note: note.trim() || null,
        },
      });
      onClose();
    } catch {
      // error shown by mutation
    }
  }

  if (!expense) return null;

  const numAmount = parseFloat(amount) || 0;
  const newBalance = Math.max(0, expense.remainingBalance - numAmount);
  const isOverpaying = numAmount > expense.remainingBalance;

  return (
    <Dialog open={Boolean(expense)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-5 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Record Repayment from {expense.personName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Record a partial or full repayment. The outstanding balance will update automatically.
          </p>
        </DialogHeader>

        {/* Current status summary card */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-muted-foreground">Total Lent</span>
              <p className="mt-0.5 font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Repaid</span>
              <p className="mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(expense.repaidAmount)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining</span>
              <p className="mt-0.5 font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(expense.remainingBalance)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="repayAmount" className="text-xs font-medium">
                Repayment Amount (₹)
              </Label>
              {expense.remainingBalance > 0 ? (
                <button
                  type="button"
                  onClick={() => setAmount(String(expense.remainingBalance))}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Pay Full Balance ({formatCurrency(expense.remainingBalance)})
                </button>
              ) : null}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                ₹
              </span>
              <Input
                id="repayAmount"
                type="number"
                step="any"
                min="0.01"
                autoFocus
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-sm font-medium"
              />
            </div>
            {isOverpaying ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Note: Amount exceeds remaining balance by {formatCurrency(numAmount - expense.remainingBalance)}.
              </p>
            ) : null}
          </div>

          {/* Date input */}
          <div className="space-y-1.5">
            <Label htmlFor="repayDate" className="text-xs font-medium">
              Payment Date
            </Label>
            <Input
              id="repayDate"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <Label htmlFor="repayNote" className="text-xs font-medium">
              Note (optional)
            </Label>
            <Input
              id="repayNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid via UPI, Cash, Bank Transfer"
              className="text-sm"
            />
          </div>

          {/* Live balance preview */}
          {numAmount > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>New Remaining Balance:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(newBalance)}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={numAmount <= 0 || addRepayment.isPending}
              className="gap-1.5"
            >
              {addRepayment.isPending ? "Recording..." : "Save Repayment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
