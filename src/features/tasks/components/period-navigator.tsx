"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPeriodLabel, type PlanningLevel } from "@/lib/period";

interface PeriodNavigatorProps {
  level: PlanningLevel;
  date: Date;
  onChange: (date: Date) => void;
  onToday: () => void;
}

export function PeriodNavigator({ level, date, onChange, onToday }: PeriodNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" aria-label="Previous period" onClick={() => onChange(shift(level, date, -1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[10rem] text-center text-sm font-medium">
        {getPeriodLabel(level, date)}
      </span>
      <Button variant="outline" size="icon" aria-label="Next period" onClick={() => onChange(shift(level, date, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onToday}>
        Today
      </Button>
    </div>
  );
}

function shift(level: PlanningLevel, date: Date, direction: 1 | -1): Date {
  const result = new Date(date);
  switch (level) {
    case "DAY":
      result.setDate(result.getDate() + direction);
      break;
    case "WEEK":
      result.setDate(result.getDate() + direction * 7);
      break;
    case "MONTH":
      result.setMonth(result.getMonth() + direction);
      break;
    case "QUARTER":
      result.setMonth(result.getMonth() + direction * 3);
      break;
    case "SIX_MONTH":
      result.setMonth(result.getMonth() + direction * 6);
      break;
    case "YEAR":
      result.setFullYear(result.getFullYear() + direction);
      break;
  }
  return result;
}