"use client";

import { Archive, Loader2 } from "lucide-react";
import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import {
  useArchiveTask,
  useCompleteTask,
  useReopenTask,
} from "@/features/tasks/mutations/use-task-mutations";
import type { TaskDTO } from "@/features/tasks/types";
import { Button } from "@/components/ui/button";

function formatMinutes(minutes: number | null): string {
  if (!minutes) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours > 0) {
    return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  return `${remainder}m`;
}

interface TaskRowProps {
  task: TaskDTO;
}

export function TaskRow({ task }: TaskRowProps) {
  const complete = useCompleteTask();
  const reopen = useReopenTask();
  const archive = useArchiveTask();

  const isDone = task.status === "COMPLETED";

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Checkbox
        checked={isDone}
        onCheckedChange={() => (isDone ? reopen.mutate(task.id) : complete.mutate(task.id))}
        disabled={complete.isPending || reopen.isPending}
        aria-label={isDone ? "Reopen task" : "Complete task"}
      />
      <div className="min-w-0 flex-1">
        <Link href={`/tasks/${task.id}`} className="truncate font-medium hover:underline">
          {task.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.category ? <span>{task.category.name}</span> : null}
          {task.dueDate ? <span>Due {new Date(task.dueDate).toLocaleDateString()}</span> : null}
          {task.targetTime ? <span>{task.targetTime}</span> : null}
          <span>Est {formatMinutes(task.estimatedMinutes)}</span>
          {task.subtaskSummary.total > 0 ? (
            <span>
              {task.subtaskSummary.completed}/{task.subtaskSummary.total} subtasks
            </span>
          ) : null}
        </div>
      </div>
      <TaskPriorityBadge priority={task.priority} />
      <TaskStatusBadge status={task.status} />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Archive task"
        onClick={() => archive.mutate(task.id)}
        disabled={archive.isPending}
      >
        {archive.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}