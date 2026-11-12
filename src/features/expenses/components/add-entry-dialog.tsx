"use client";

import { HandCoins } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localDateKey } from "@/lib/period";
import { useAddExpenseEntry } from "@/features/expenses/hooks/use-expenses";
import { formatCurrency, type ExpenseDTO } from "@/features/expenses/types";

interface AddEntryDialogProps {
  expense: ExpenseDTO | null;
  onClose: () => void;
}

export function AddEntryDialog({ expense, onClose }: AddEntryDialogProps) {
  const today = localDateKey();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  const addEntry = useAddExpenseEntry();

  if (!expense) return null;

  const numAmount = parseFloat(amount) || 0;
  const newTotalLent = expense.amount + numAmount;
  const newBalance = expense.remainingBalance + numAmount;

  function resetForm() {
    setAmount("");
    setDate(today);
    setNote("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expense || numAmount <= 0) return;

    try {
      await addEntry.mutateAsync({
        expenseId: expense.id,
        data: {
          amount: numAmount,
          date: date || today,
          note: note.trim() || null,
        },
      });
      resetForm();
      onClose();
    } catch {
      // error handled by mutation
    }
  }

  return (
    <Dialog open={Boolean(expense)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-5 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HandCoins className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Add More Money
            </span>
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Lend More to {expense.personName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Add another lending transaction to this existing record. It will be combined into{" "}
            {expense.personName}&apos;s overall balance without creating a duplicate record.
          </p>
        </DialogHeader>

        {/* Current status summary card */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Current Total Lent:</span>
              <p className="font-semibold text-foreground">
                {formatCurrency(expense.amount)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Current Outstanding:</span>
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                {formatCurrency(expense.remainingBalance)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div className="space-y-1.5">
            <Label htmlFor="entryAmount" className="text-xs font-medium">
              Additional Amount to Lend (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                ₹
              </span>
              <Input
                id="entryAmount"
                type="number"
                step="any"
                min="0.01"
                autoFocus
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="pl-8 text-sm font-medium"
              />
            </div>
          </div>

          {/* Date input */}
          <div className="space-y-1.5">
            <Label htmlFor="entryDate" className="text-xs font-medium">
              Date Given
            </Label>
            <Input
              id="entryDate"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <Label htmlFor="entryNote" className="text-xs font-medium">
              Note (optional)
            </Label>
            <Input
              id="entryNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Additional ₹500 for groceries, travel, etc."
              className="text-sm"
            />
          </div>

          {/* Live preview of new balance */}
          {numAmount > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>New Total Lent:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(newTotalLent)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">New Outstanding Balance:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
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
              disabled={numAmount <= 0 || addEntry.isPending}
              className="gap-1.5"
            >
              {addEntry.isPending ? "Adding..." : "Add Money"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
