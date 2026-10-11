"use client";

import { Check, Clock, GripVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { TaskDTO } from "@/features/tasks/hooks/use-planner-tasks";

interface TaskRowProps {
  task: TaskDTO;
  onToggleComplete: (id: string, completed: boolean) => void;
  onTitleCommit: (id: string, title: string) => void;
  onOpen: (task: TaskDTO) => void;
}

function formatMinutes(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/**
 * The single most-rendered surface in the product — every pixel here is
 * seen hundreds of times a session, so it gets the most design attention:
 * a tactile checkbox with a spring-in checkmark, a calm hover treatment
 * (background shift only, no layout jump), and metadata that stays quiet
 * until it has something worth saying.
 */
export function TaskRow({ task, onToggleComplete, onTitleCommit, onOpen }: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onTitleCommit(task.id, trimmed);
    } else {
      setDraftTitle(task.title);
    }
  }

  const estimate = formatMinutes(task.estimatedMinutes);
  const subtaskProgress =
    task.subtasks.length > 0
      ? `${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length}`
      : null;
  const hasMeta = Boolean(estimate || subtaskProgress || task.scheduledDate || task.sourceLinkType);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !editing && onOpen(task)}
      onKeyDown={(e) => {
        if (!editing && (e.key === "Enter" || e.key === " ")) onOpen(task);
      }}
      className={cn(
        "group/row animate-in fade-in slide-in-from-top-0.5 relative flex items-start gap-2.5 rounded-lg px-2.5 py-2 duration-150",
        "transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none",
      )}
    >
      <GripVertical className="mt-[3px] h-4 w-4 shrink-0 cursor-grab text-transparent transition-colors group-hover/row:text-muted-foreground/35" />

      <button
        type="button"
        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
        aria-pressed={task.completed}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id, !task.completed);
        }}
        className={cn(
          "mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-200 ease-out",
          "hover:scale-110 active:scale-95",
          task.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/35 hover:border-primary/70",
        )}
      >
        <Check
          className={cn(
            "h-3 w-3 transition-all duration-200",
            task.completed ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
          strokeWidth={3}
        />
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                setDraftTitle(task.title);
                setEditing(false);
              }
            }}
            className="w-full rounded border-b border-primary/50 bg-transparent text-sm leading-snug outline-none"
          />
        ) : (
          <p
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className={cn(
              "truncate text-sm leading-snug tracking-[-0.006em] transition-colors",
              task.completed ? "text-muted-foreground/70 line-through" : "text-foreground",
            )}
          >
            {task.title}
          </p>
        )}

        {hasMeta && !editing ? (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-muted-foreground/80">
            {estimate ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {estimate}
              </span>
            ) : null}
            {task.scheduledDate ? (
              <span>
                {task.scheduledDate}
                {task.scheduledTime ? ` · ${task.scheduledTime}` : ""}
              </span>
            ) : null}
            {subtaskProgress ? <span>{subtaskProgress} subtasks</span> : null}
            {task.sourceLinkType === "IMPORTED" ? (
              <span className="rounded-full bg-muted px-1.5 py-[1px] text-[11px] italic">imported</span>
            ) : null}
            {task.sourceLinkType === "BROKEN_DOWN" ? (
              <span className="rounded-full bg-muted px-1.5 py-[1px] text-[11px] italic">from breakdown</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
