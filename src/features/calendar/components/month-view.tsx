"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { localDateKey } from "@/lib/period";
import { getMonthGrid, getTasksForDay, parseDateParts, WEEKDAY_LABELS } from "@/features/calendar/utils";
import { CalendarTaskChip } from "@/features/calendar/components/calendar-task-chip";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";

interface MonthViewProps {
  year: number;
  month: number; // 1-indexed
  tasks: CalendarTaskDTO[];
  onTaskClick: (task: CalendarTaskDTO) => void;
  onDateClick: (dateKey: string) => void;
}

export function MonthView({ year, month, tasks, onTaskClick, onDateClick }: MonthViewProps) {
  const today = localDateKey();
  const dates = useMemo(() => getMonthGrid(year, month), [year, month]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTaskDTO[]>();
    for (const dateKey of dates) {
      map.set(dateKey, getTasksForDay(tasks, dateKey, today));
    }
    return map;
  }, [dates, tasks, today]);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0">
        {dates.map((dateKey) => {
          const { day, month: cellMonth } = parseDateParts(dateKey);
          const isCurrentMonth = cellMonth === month;
          const isToday = dateKey === today;
          const dayTasks = tasksByDay.get(dateKey) ?? [];
          const MAX_VISIBLE = 3;
          const visibleTasks = dayTasks.slice(0, MAX_VISIBLE);
          const overflow = dayTasks.length - MAX_VISIBLE;

          return (
            <div
              key={dateKey}
              className={cn(
                "group/cell border-b border-r border-border min-h-[100px] p-1.5 cursor-pointer transition-colors",
                !isCurrentMonth && "bg-muted/20",
                isToday && "bg-primary/5",
                "hover:bg-accent/30",
              )}
              onClick={() => onDateClick(dateKey)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50",
                  )}
                >
                  {day}
                </span>
                <button
                  type="button"
                  aria-label={`Add task on ${dateKey}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick(dateKey);
                  }}
                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity flex h-5 w-5 items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks */}
              <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
                {visibleTasks.map((task) => (
                  <CalendarTaskChip
                    key={task.id}
                    task={task}
                    compact
                    onClick={onTaskClick}
                  />
                ))}
                {overflow > 0 ? (
                  <p className="pl-1 text-[11px] text-muted-foreground">+{overflow} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
