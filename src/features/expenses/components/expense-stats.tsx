"use client";

import { CheckCircle2, Clock, HandCoins, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency, type ExpenseStatsDTO } from "@/features/expenses/types";

interface ExpenseStatsProps {
  stats: ExpenseStatsDTO | undefined;
  isLoading: boolean;
}

export function ExpenseStats({ stats, isLoading }: ExpenseStatsProps) {
  const cards = [
    {
      title: "Total Lent",
      value: stats ? formatCurrency(stats.totalLent) : "₹0",
      description: `${stats?.totalTransactionsCount ?? 0} active people`,
      icon: HandCoins,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Recovered",
      value: stats ? formatCurrency(stats.totalRecovered) : "₹0",
      description: `${stats?.fullyRepaidCount ?? 0} fully settled`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Outstanding",
      value: stats ? formatCurrency(stats.totalOutstanding) : "₹0",
      description: "Remaining to be collected",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      highlight: true,
    },
    {
      title: "Active Borrowers",
      value: String(stats?.activeDebtorsCount ?? 0),
      description: "People with pending balance",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={cn(
              "flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 transition-all",
              card.highlight && "border-amber-500/30 bg-amber-500/5",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  card.bg,
                  card.color,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3">
              {isLoading ? (
                <div className="h-7 w-24 rounded bg-muted animate-pulse" />
              ) : (
                <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {card.value}
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
