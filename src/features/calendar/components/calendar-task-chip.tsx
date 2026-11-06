"use client";

import { AlertCircle, Check, Clock, RotateCcw, SkipForward } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { formatDuration, formatTime, todayKey } from "@/features/calendar/utils";
import {
  useCalendarUpdateTask,
  useSkipTask,
  useUnskipTask,
} from "@/features/calendar/hooks/use-calendar-tasks";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";

interface CalendarTaskChipProps {
  task: CalendarTaskDTO;
  /** The date key ("YYYY-MM-DD") of the calendar cell or column where this chip is rendered */
  cellDate?: string;
  /** Show compact title-only layout (used in Month view grid) */
  compact?: boolean;
  onClick: (task: CalendarTaskDTO) => void;
}

/**
 * A task pill rendered inside a calendar cell.
 * - Completed tasks get a strikethrough + muted colour.
 * - Original past date uncompleted tasks get a rose left border + "Not completed" badge.
 * - Carried-forward tasks on today get an amber left border + "Carried over" badge.
 * - Skipped tasks get an amber/yellow "skipped" badge with unskip option.
 */
export function CalendarTaskChip({ task, cellDate, compact, onClick }: CalendarTaskChipProps) {
  const [hovered, setHovered] = useState(false);
  const updateTask = useCalendarUpdateTask();
  const skipTask = useSkipTask();
  const unskipTask = useUnskipTask();

  const today = todayKey();
  const isSkipped = Boolean(task.skippedAt);

  // Is this chip rendered on a past date where it was originally scheduled and left uncompleted?
  const isPastCell = Boolean(cellDate) && cellDate! < today;
  const isOriginalPastUncompleted =
    isPastCell &&
    task.scheduledDate === cellDate &&
    !task.completed &&
    !isSkipped;

  // Is this chip rendered on today as a carried-over task from an earlier date?
  const isCarriedForwardToToday =
    (cellDate ? cellDate === today : task.isCarriedForward) &&
    Boolean(task.scheduledDate) &&
    task.scheduledDate! < today &&
    !task.completed &&
    !isSkipped;

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
      title={
        isOriginalPastUncompleted
          ? `Scheduled for ${task.scheduledDate} but was not completed • Carried forward`
          : isCarriedForwardToToday
            ? `Carried forward from ${task.originalDate}`
            : task.title
      }
      className={cn(
        "group/chip relative flex min-w-0 cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-all duration-150",
        "border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        task.completed
          ? "border-border/40 bg-muted/50 text-muted-foreground/60"
          : isOriginalPastUncompleted
            ? "border-l-2 border-l-rose-500 border-t-border/40 border-r-border/40 border-b-border/40 bg-rose-50/50 text-foreground dark:bg-rose-950/25"
            : isCarriedForwardToToday
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
            : isOriginalPastUncompleted
              ? "border-rose-400 bg-rose-100/60 hover:border-rose-600 dark:border-rose-700 dark:bg-rose-950/40"
              : "border-muted-foreground/40 hover:border-primary/70",
        )}
      >
        {task.completed && <Check className="h-2 w-2" strokeWidth={3} />}
      </button>

      {/* Task info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 overflow-hidden">
          <span
            className={cn(
              "truncate leading-tight",
              task.completed && "line-through",
              isSkipped && !task.completed && "opacity-60",
            )}
          >
            {!compact && task.scheduledTime ? (
              <span className="mr-1 font-medium opacity-70">{formatTime(task.scheduledTime)}</span>
            ) : null}
            {task.title}
          </span>

          {/* Compact tags for Month view */}
          {compact && isOriginalPastUncompleted ? (
            <span
              title="Not completed on this day"
              className="inline-flex shrink-0 items-center rounded bg-rose-100 px-1 py-px text-[9px] font-semibold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
            >
              Not done
            </span>
          ) : null}

          {compact && isCarriedForwardToToday ? (
            <span
              title="Carried over from earlier day"
              className="inline-flex shrink-0 items-center rounded bg-amber-100 px-1 py-px text-[9px] font-semibold text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
            >
              Carried
            </span>
          ) : null}
        </div>

        {/* Detailed tags for Week / Day / Agenda view */}
        {!compact && (
          <div className="flex flex-wrap items-center gap-1.5 opacity-80">
            {task.estimatedMinutes ? (
              <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {formatDuration(task.estimatedMinutes)}
              </span>
            ) : null}

            {isOriginalPastUncompleted ? (
              <span
                title="This task was scheduled for this day but was not completed"
                className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-px text-[10px] font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
              >
                <AlertCircle className="h-2.5 w-2.5 text-rose-600 dark:text-rose-400" />
                Not completed
              </span>
            ) : null}

            {isCarriedForwardToToday ? (
              <span
                title={`Carried over from ${task.originalDate}`}
                className="rounded bg-amber-100 px-1.5 py-px text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
              >
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
