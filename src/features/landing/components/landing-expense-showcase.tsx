"use client";

import { HandCoins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LandingExpenseShowcase() {
  return (
    <section id="expenses" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Visual UI Demonstration of Multi-Loan per Person */}
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <p className="text-base font-bold text-foreground">Rahul Sharma</p>
                <p className="text-xs text-muted-foreground">Contact & Lending History</p>
              </div>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
                ₹1,500 Outstanding
              </Badge>
            </div>

            {/* Timeline of multiple loans */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-xs">
                <div>
                  <p className="font-medium text-foreground">Nov 1 · Lent for concert ticket</p>
                  <p className="text-[11px] text-muted-foreground">Original loan transaction</p>
                </div>
                <span className="font-semibold text-foreground">+ ₹1,000</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-xs">
                <div>
                  <p className="font-medium text-foreground">Nov 5 · Added cab fare contribution</p>
                  <p className="text-[11px] text-muted-foreground">Added to existing person record</p>
                </div>
                <span className="font-semibold text-foreground">+ ₹500</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
                <div>
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    Nov 10 · Partial repayment via UPI
                  </p>
                  <p className="text-[11px] text-muted-foreground">Auto-deducted from balance</p>
                </div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">- ₹500</span>
              </div>

              {/* Progress bar */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Repayment Progress (33%)</span>
                  <span className="font-bold text-foreground">₹1,000 Remaining</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/3 rounded-full transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <HandCoins className="h-3.5 w-3.5" />
              Integrated Expense Tracker
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Track money lent without awkward spreadsheets.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              When you lend money to friends, family, or colleagues, separate notes get lost and dedicated
              accounting apps are over-engineered.
            </p>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Log-Book includes a dedicated expense tracker built specifically for tracking money lent.
              Add multiple loans to the same person over time, log partial or full repayments, and always know
              exactly who owes what at a single glance.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                <p className="font-semibold text-foreground">Multi-Loan History</p>
                <p className="mt-1 text-muted-foreground">
                  Give Rahul ₹1,000 on Nov 1, add ₹500 on Nov 5—combined balance updates automatically.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                <p className="font-semibold text-foreground">Outstanding Priority</p>
                <p className="mt-1 text-muted-foreground">
                  Money remaining to collect is prioritized as the first stat card so you never lose track.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
