"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { formatPeriodEyebrow, formatPeriodTitle, shiftPeriodKey, type PlanningLevel } from "@/lib/period";

interface PeriodHeaderProps {
  level: PlanningLevel;
  periodKey: string;
  todayKey: string;
  onNavigate: (periodKey: string) => void;
}

const LEVEL_ACCENT: Record<PlanningLevel, string> = {
  YEAR: "bg-violet-500",
  SIX_MONTH: "bg-indigo-500",
  QUARTER: "bg-blue-500",
  MONTH: "bg-sky-500",
  WEEK: "bg-teal-500",
  DAY: "bg-emerald-500",
};

/**
 * A quiet per-level accent dot gives each of the six planners a subtle,
 * consistent identity (useful when switching between them quickly) without
 * resorting to loud color-coding of the whole page.
 */
export function PeriodHeader({ level, periodKey, todayKey, onNavigate }: PeriodHeaderProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key === "ArrowLeft" && (e.metaKey || e.altKey)) {
        e.preventDefault();
        onNavigate(shiftPeriodKey(level, periodKey, -1));
      }
      if (e.key === "ArrowRight" && (e.metaKey || e.altKey)) {
        e.preventDefault();
        onNavigate(shiftPeriodKey(level, periodKey, 1));
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [level, periodKey, onNavigate]);

  return (
    <div className="flex items-end justify-between border-b border-border/60 pb-4">
      <div className="flex items-center gap-3">
        <span className={`mb-1 h-2 w-2 shrink-0 rounded-full ${LEVEL_ACCENT[level]}`} aria-hidden />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {formatPeriodEyebrow(level, periodKey)}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">{formatPeriodTitle(level, periodKey)}</h1>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous period"
          title="Previous (⌥ ←)"
          onClick={() => onNavigate(shiftPeriodKey(level, periodKey, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={periodKey === todayKey}
          onClick={() => onNavigate(todayKey)}
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next period"
          title="Next (⌥ →)"
          onClick={() => onNavigate(shiftPeriodKey(level, periodKey, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
