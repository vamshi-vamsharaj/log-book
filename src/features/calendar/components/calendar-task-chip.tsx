"use client";

import { Check, Clock, RotateCcw, SkipForward } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { formatDuration, formatTime } from "@/features/calendar/utils";
import {
  useCalendarUpdateTask,
  useSkipTask,
  useUnskipTask,
} from "@/features/calendar/hooks/use-calendar-tasks";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";

interface CalendarTaskChipProps {
  task: CalendarTaskDTO;
  /** Show time prefix if task has a scheduledTime */
  compact?: boolean;
  onClick: (task: CalendarTaskDTO) => void;
}

/**
 * A small task pill rendered inside a calendar cell.
 * - Completed tasks get a strikethrough + muted colour.
 * - Skipped tasks get an amber/yellow "skipped" badge.
 * - Carried-forward tasks get an orange left border and overdue badge.
 */
export function CalendarTaskChip({ task, compact, onClick }: CalendarTaskChipProps) {
  const [hovered, setHovered] = useState(false);
  const updateTask = useCalendarUpdateTask();
  const skipTask = useSkipTask();
  const unskipTask = useUnskipTask();

  const isSkipped = Boolean(task.skippedAt);

  function handleToggleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    updateTask.mutate({ id: task.id, completed: !task.completed });
  }

  function handleSkip(e: React.MouseEvent) {
    e.stopPropagation();
    skipTask.mutate(task.id);
  }

  function handleUnskip(e: React.MouseEvent) {
    e.stopPropagation();
    unskipTask.mutate(task.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(task)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group/chip relative flex min-w-0 cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-all duration-150",
        "border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        task.completed
          ? "border-border/40 bg-muted/50 text-muted-foreground/60"
          : task.isCarriedForward
            ? "border-l-2 border-l-amber-500 border-t-border/40 border-r-border/40 border-b-border/40 bg-amber-50/50 text-foreground dark:bg-amber-950/20"
            : isSkipped
              ? "border-border/40 bg-muted/30 text-muted-foreground/70"
              : "border-border/40 bg-card text-foreground hover:bg-accent/60 hover:border-border",
      )}
    >
      {/* Complete button */}
      <button
        type="button"
        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
        onClick={handleToggleComplete}
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-all",
          task.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 hover:border-primary/70",
        )}
      >
        {task.completed && <Check className="h-2 w-2" strokeWidth={3} />}
      </button>

      {/* Task info */}
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate leading-tight",
            task.completed && "line-through",
            isSkipped && !task.completed && "opacity-60",
          )}
        >
          {!compact && task.scheduledTime ? (
            <span className="mr-1 font-medium opacity-70">{formatTime(task.scheduledTime)}</span>
          ) : null}
          {task.title}
        </span>
        {!compact && (
          <div className="flex items-center gap-1.5 opacity-60">
            {task.estimatedMinutes ? (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {formatDuration(task.estimatedMinutes)}
              </span>
            ) : null}
            {task.isCarriedForward && !task.completed ? (
              <span className="rounded bg-amber-100 px-1 py-px text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                carried over
              </span>
            ) : null}
            {isSkipped && !task.completed ? (
              <button
                type="button"
                onClick={handleUnskip}
                title="Click to unskip task"
                className="inline-flex items-center gap-0.5 rounded bg-amber-100/90 px-1 py-px text-[10px] font-medium text-amber-800 transition-colors hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                skipped
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Skip / Unskip button on hover */}
      {hovered && !task.completed && (
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          {!isSkipped ? (
            <button
              type="button"
              aria-label="Skip task"
              onClick={handleSkip}
              title="Skip this task"
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-accent hover:text-amber-600"
            >
              <SkipForward className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Unskip task"
              onClick={handleUnskip}
              title="Unskip task (resume)"
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
