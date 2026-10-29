"use client";

import { Clock, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { localDateKey } from "@/lib/period";
import { getTasksForDay, formatTime, formatDuration, parseDateParts, FULL_WEEKDAY_LABELS, MONTH_NAMES, WEEKDAY_LABELS } from "@/features/calendar/utils";
import { weekdayIndex } from "@/lib/period";
import { CalendarTaskChip } from "@/features/calendar/components/calendar-task-chip";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";

interface DayViewProps {
  dateKey: string;
  tasks: CalendarTaskDTO[];
  onTaskClick: (task: CalendarTaskDTO) => void;
  onAddTask: (dateKey: string) => void;
}

export function DayView({ dateKey, tasks, onTaskClick, onAddTask }: DayViewProps) {
  const today = localDateKey();
  const isToday = dateKey === today;
  const { year, month, day } = parseDateParts(dateKey);
  const dow = weekdayIndex(dateKey);

  const dayTasks = getTasksForDay(tasks, dateKey, today);
  const scheduled = dayTasks.filter((t) => t.scheduledTime).sort((a, b) =>
    (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? ""),
  );
  const unscheduled = dayTasks.filter((t) => !t.scheduledTime);
  const carryForward = dayTasks.filter((t) => t.isCarriedForward);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day header */}
      <div className={cn(
        "px-6 py-4 border-b border-border",
        isToday && "bg-primary/5",
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {FULL_WEEKDAY_LABELS[dow]}
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              <span className={cn(isToday && "text-primary")}>{day}</span>
              <span className="ml-2 text-xl font-normal text-muted-foreground">
                {MONTH_NAMES[month - 1]} {year}
              </span>
            </h2>
            {isToday && (
              <p className="mt-0.5 text-xs font-medium text-primary">Today</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddTask(dateKey)}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>

        {/* Summary pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
          </span>
          {carryForward.length > 0 ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              {carryForward.length} carried over
            </span>
          ) : null}
          {dayTasks.filter(t => t.completed).length > 0 ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-400">
              {dayTasks.filter(t => t.completed).length} completed
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Timed tasks */}
        {scheduled.length > 0 ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Scheduled
            </h3>
            <div className="space-y-2">
              {scheduled.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className="w-14 shrink-0 pt-1 text-right text-xs font-medium text-muted-foreground">
                    {task.scheduledTime ? formatTime(task.scheduledTime) : null}
                  </div>
                  <div className="flex-1">
                    <CalendarTaskChip task={task} onClick={onTaskClick} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Unscheduled tasks */}
        {unscheduled.length > 0 ? (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Anytime
            </h3>
            <div className="space-y-1.5">
              {unscheduled.map((task) => (
                <CalendarTaskChip key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          </section>
        ) : null}

        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">Nothing scheduled for this day.</p>
            <button
              type="button"
              onClick={() => onAddTask(dateKey)}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Add a task
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
