"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { localDateKey } from "@/lib/period";
import { getWeekDays, getTasksForDay, parseDateParts, SHORT_MONTH_NAMES, WEEKDAY_LABELS } from "@/features/calendar/utils";
import { CalendarTaskChip } from "@/features/calendar/components/calendar-task-chip";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";

interface WeekViewProps {
  weekStartDate: string; // ISO date of Monday
  tasks: CalendarTaskDTO[];
  onTaskClick: (task: CalendarTaskDTO) => void;
  onDateClick: (dateKey: string) => void;
}

export function WeekView({ weekStartDate, tasks, onTaskClick, onDateClick }: WeekViewProps) {
  const today = localDateKey();
  const days = useMemo(() => getWeekDays(weekStartDate), [weekStartDate]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTaskDTO[]>();
    for (const dateKey of days) {
      map.set(dateKey, getTasksForDay(tasks, dateKey, today));
    }
    return map;
  }, [days, tasks, today]);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Column headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((dateKey, idx) => {
          const { day, month } = parseDateParts(dateKey);
          const isToday = dateKey === today;
          return (
            <div
              key={dateKey}
              className="flex flex-col items-center py-3 border-r border-border last:border-r-0 gap-1"
            >
              <span
                className={cn(
                  "text-xs font-medium uppercase tracking-wide",
                  isToday ? "text-primary" : "text-muted-foreground",
                )}
              >
                {WEEKDAY_LABELS[idx]}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent/60 cursor-pointer",
                )}
                onClick={() => onDateClick(dateKey)}
              >
                {day}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {SHORT_MONTH_NAMES[month - 1]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Task columns */}
      <div className="grid grid-cols-7 flex-1 min-h-0 overflow-y-auto">
        {days.map((dateKey) => {
          const isToday = dateKey === today;
          const dayTasks = tasksByDay.get(dateKey) ?? [];

          return (
            <div
              key={dateKey}
              className={cn(
                "group/col border-r border-border last:border-r-0 p-2 cursor-pointer transition-colors min-h-[300px]",
                isToday ? "bg-primary/5" : "hover:bg-accent/20",
              )}
              onClick={() => onDateClick(dateKey)}
            >
              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                {dayTasks.length === 0 ? (
                  <button
                    type="button"
                    aria-label={`Add task on ${dateKey}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(dateKey);
                    }}
                    className="w-full flex items-center justify-center gap-1 py-3 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors opacity-0 group-hover/col:opacity-100"
                  >
                    <Plus className="h-3 w-3" />
                    Add task
                  </button>
                ) : null}
                {dayTasks.map((task) => (
                  <CalendarTaskChip
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                  />
                ))}
                {dayTasks.length > 0 ? (
                  <button
                    type="button"
                    aria-label={`Add task on ${dateKey}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(dateKey);
                    }}
                    className="w-full flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors opacity-0 group-hover/col:opacity-100"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
