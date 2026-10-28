"use client";

import { CalendarDays } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { localDateKey, addDays } from "@/lib/period";
import { getTasksForDay, parseDateParts, FULL_WEEKDAY_LABELS, SHORT_MONTH_NAMES } from "@/features/calendar/utils";
import { weekdayIndex } from "@/lib/period";
import { CalendarTaskChip } from "@/features/calendar/components/calendar-task-chip";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";

interface AgendaViewProps {
  startDate: string;
  tasks: CalendarTaskDTO[];
  onTaskClick: (task: CalendarTaskDTO) => void;
  onDateClick: (dateKey: string) => void;
}

/** Shows the next 30 days as a scrollable list, grouping tasks under each date. */
export function AgendaView({ startDate, tasks, onTaskClick, onDateClick }: AgendaViewProps) {
  const today = localDateKey();

  const daysWithTasks = useMemo(() => {
    const list: Array<{ dateKey: string; tasks: CalendarTaskDTO[] }> = [];
    for (let i = 0; i < 30; i++) {
      const dateKey = addDays(startDate, i);
      const dayTasks = getTasksForDay(tasks, dateKey, today);
      if (dayTasks.length > 0) {
        list.push({ dateKey, tasks: dayTasks });
      }
    }
    return list;
  }, [startDate, tasks, today]);

  const hasAnyTasks = daysWithTasks.length > 0;

  return (
    <div className="flex-1 overflow-y-auto px-2 py-3">
      {!hasAnyTasks ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No tasks scheduled in the next 30 days.</p>
        </div>
      ) : null}

      {daysWithTasks.map(({ dateKey, tasks: dayTasks }) => {
        if (dayTasks.length === 0) return null;
        const { day, month, year } = parseDateParts(dateKey);
        const isToday = dateKey === today;
        const dow = weekdayIndex(dateKey);
        const carryCount = dayTasks.filter((t) => t.isCarriedForward).length;

        return (
          <div key={dateKey} className="mb-4 flex gap-4">
            {/* Sticky date label */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => onDateClick(dateKey)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDateClick(dateKey)}
              className={cn(
                "w-16 shrink-0 cursor-pointer rounded-lg p-2 text-center transition-colors hover:bg-accent/60",
                isToday && "bg-primary/10",
              )}
            >
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                isToday ? "text-primary" : "text-muted-foreground",
              )}>
                {FULL_WEEKDAY_LABELS[dow]?.slice(0, 3)}
              </p>
              <p className={cn(
                "mt-0.5 text-2xl font-bold leading-none",
                isToday ? "text-primary" : "text-foreground",
              )}>
                {day}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {SHORT_MONTH_NAMES[month - 1]} {year}
              </p>
              {carryCount > 0 ? (
                <span className="mt-1 inline-block rounded-full bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  +{carryCount}
                </span>
              ) : null}
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-1.5 pt-1">
              {dayTasks.map((task) => (
                <CalendarTaskChip key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
