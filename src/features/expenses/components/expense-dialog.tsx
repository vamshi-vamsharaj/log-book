"use client";

import { HandCoins, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localDateKey } from "@/lib/period";
import { useCreateExpense, useExpenses } from "@/features/expenses/hooks/use-expenses";
import { formatCurrency, type TransactionType } from "@/features/expenses/types";

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseDialog({ isOpen, onClose }: ExpenseDialogProps) {
  const today = localDateKey();

  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<TransactionType>("LENT");

  const createExpense = useCreateExpense();
  const { data: allExpenses } = useExpenses();

  // Find if a person with this name already exists
  const existingPerson = useMemo(() => {
    if (!personName.trim() || !allExpenses) return null;
    const clean = personName.trim().toLowerCase();
    return allExpenses.find(
      (e) => e.personName.trim().toLowerCase() === clean && e.type === type,
    );
  }, [personName, allExpenses, type]);

  // List of unique active people to suggest
  const existingPeople = useMemo(() => {
    if (!allExpenses) return [];
    const unique = new Map<string, string>();
    for (const exp of allExpenses) {
      if (exp.type === type && !unique.has(exp.personName.toLowerCase())) {
        unique.set(exp.personName.toLowerCase(), exp.personName);
      }
    }
    return Array.from(unique.values());
  }, [allExpenses, type]);

  const numAmount = parseFloat(amount) || 0;
  const newCombinedBalance = existingPerson ? existingPerson.remainingBalance + numAmount : numAmount;

  function resetForm() {
    setPersonName("");
    setAmount("");
    setDate(today);
    setDueDate("");
    setNote("");
    setType("LENT");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personName.trim() || numAmount <= 0) return;

    try {
      await createExpense.mutateAsync({
        personName: personName.trim(),
        amount: numAmount,
        date: date || today,
        dueDate: dueDate || null,
        note: note.trim() || null,
        type,
      });
      resetForm();
      onClose();
    } catch {
      // error shown by mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-5 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HandCoins className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {type === "LENT" ? "Money Lent" : "Money Borrowed"}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Record Money Lent / Transaction
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Track money given to someone. If the person already exists, this amount will be added to their existing record.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Transaction Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("LENT")}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  type === "LENT"
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border/70 bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                Money Lent (I gave)
              </button>
              <button
                type="button"
                onClick={() => setType("BORROWED")}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  type === "BORROWED"
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border/70 bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                Money Borrowed (I took)
              </button>
            </div>
          </div>

          {/* Person Name with Autocomplete suggestions */}
          <div className="space-y-1.5">
            <Label htmlFor="personName" className="text-xs font-medium">
              {type === "LENT" ? "Who did you give money to?" : "Who did you borrow from?"}
            </Label>
            <Input
              id="personName"
              autoFocus
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Rahul, Sarah, John"
              className="text-sm font-medium"
            />

            {/* Quick existing person suggestion chips */}
            {existingPeople.length > 0 && !personName && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground">Existing:</span>
                {existingPeople.slice(0, 4).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setPersonName(name)}
                    className="rounded-full border border-border/80 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* Notice if this person already exists */}
            {existingPerson && (
              <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-xs text-foreground">
                <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-primary">
                    {existingPerson.personName} already has an active record
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Current outstanding: {formatCurrency(existingPerson.remainingBalance)}. This will be added to their existing balance without creating a duplicate person.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Amount (₹) */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-medium">
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="pl-7 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-medium">
                Date Given
              </Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-medium">
                Due Date <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs font-medium">
              Note <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Travel advance, dinner, project expenses"
              className="text-sm"
            />
          </div>

          {/* Combined balance preview if existing person */}
          {existingPerson && numAmount > 0 && (
            <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>New Total Lent:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(existingPerson.amount + numAmount)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">New Total Outstanding:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(newCombinedBalance)}
                </span>
              </div>
            </div>
          )}

          {createExpense.isError ? (
            <p className="text-xs font-medium text-destructive">{createExpense.error.message}</p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!personName.trim() || numAmount <= 0 || createExpense.isPending}
            >
              {createExpense.isPending
                ? "Saving..."
                : existingPerson
                  ? "Add to Existing Record"
                  : "Record Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
