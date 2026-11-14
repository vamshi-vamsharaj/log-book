"use client";

import {
  CalendarPlus,
  Check,
  Clock,
  GripVertical,
  Inbox,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { localDateKey } from "@/lib/period";
import { formatDuration } from "@/features/calendar/utils";
import {
  useCalendarDeleteTask,
  useCalendarUpdateTask,
  useCreateUnscheduledTask,
  useScheduleTask,
  useUnscheduledTasks,
} from "@/features/calendar/hooks/use-calendar-tasks";
import type { TaskDTO } from "@/features/tasks/hooks/use-planner-tasks";

interface UnscheduledSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskClick: (task: TaskDTO) => void;
}

export function UnscheduledSidebar({
  isOpen,
  onClose,
  onTaskClick,
}: UnscheduledSidebarProps) {
  const [newTitle, setNewTitle] = useState("");
  const today = localDateKey();

  const { data: tasks, isLoading } = useUnscheduledTasks();
  const createTask = useCreateUnscheduledTask();
  const scheduleTask = useScheduleTask();
  const updateTask = useCalendarUpdateTask();
  const deleteTask = useCalendarDeleteTask();

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed || createTask.isPending) return;
    try {
      await createTask.mutateAsync({ title: trimmed });
      setNewTitle("");
    } catch {
      // error handled by mutation
    }
  }

  function handleScheduleToday(task: TaskDTO, e: React.MouseEvent) {
    e.stopPropagation();
    scheduleTask.mutate({ id: task.id, scheduledDate: today });
  }

  function handleToggleComplete(task: TaskDTO, e: React.MouseEvent) {
    e.stopPropagation();
    updateTask.mutate({ id: task.id, completed: !task.completed });
  }

  function handleDelete(task: TaskDTO, e: React.MouseEvent) {
    e.stopPropagation();
    deleteTask.mutate(task.id);
  }

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Unscheduled tasks holding area"
      className={cn(
        "relative flex w-80 shrink-0 flex-col border-l border-border bg-card/60 backdrop-blur-sm transition-all duration-200",
        "h-full overflow-hidden",
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Unscheduled</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {tasks?.length ?? 0}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close unscheduled tasks sidebar"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Quick Add Input ────────────────────────────────────────── */}
      <div className="border-b border-border/60 p-3">
        <form onSubmit={handleAdd} className="flex items-center gap-1.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add task to inbox..."
            className="h-8 flex-1 rounded-md border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || createTask.isPending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* ── Tasks List ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-xs text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
            Loading inbox...
          </div>
        ) : tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              role="button"
              tabIndex={0}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", task.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onClick={() => onTaskClick(task)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTaskClick(task)}
              className={cn(
                "group relative flex items-start gap-2 rounded-lg border border-border/60 bg-card p-2.5 text-xs transition-all",
                "cursor-grab active:cursor-grabbing hover:border-border hover:shadow-xs",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
            >
              {/* Drag Handle */}
              <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/70" />

              {/* Complete button */}
              <button
                type="button"
                aria-label="Mark task done"
                onClick={(e) => handleToggleComplete(task, e)}
                className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 transition-colors hover:border-primary/70"
              >
                {task.completed && <Check className="h-2 w-2 text-primary" strokeWidth={3} />}
              </button>

              {/* Title & Metadata */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground leading-snug line-clamp-2">
                  {task.title}
                </p>
                {task.estimatedMinutes ? (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{formatDuration(task.estimatedMinutes)}</span>
                  </div>
                ) : null}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  title="Schedule for Today"
                  onClick={(e) => handleScheduleToday(task, e)}
                  className="flex h-6 items-center gap-1 rounded bg-primary/10 px-1.5 text-[10px] font-medium text-primary hover:bg-primary/20"
                >
                  <CalendarPlus className="h-3 w-3" />
                  Today
                </button>
                <button
                  type="button"
                  title="Delete task"
                  onClick={(e) => handleDelete(task, e)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
            <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
              <Inbox className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-foreground">No unscheduled tasks</p>
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              Add tasks here to hold them without assigning a date.
            </p>
          </div>
        )}
      </div>

      {/* ── Footer / Drag Tip ──────────────────────────────────────── */}
      <div className="border-t border-border/60 bg-muted/20 px-3.5 py-2.5 text-[11px] text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground/80">💡 Tip:</span> Drag any task from here onto any calendar date, or click{" "}
        <span className="font-semibold text-primary">Today</span> to schedule immediately.
      </div>
    </aside>
  );
}
