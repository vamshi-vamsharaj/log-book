"use client";

import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubtaskList } from "@/features/tasks/components/subtask-list";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { TaskTimer } from "@/features/tasks/components/task-timer";
import { useCancelTask } from "@/features/tasks/mutations/use-task-mutations";
import { useTask } from "@/features/tasks/queries/use-task";

interface TaskDetailProps {
  taskId: string;
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { data: task, isLoading, isError } = useTask(taskId);
  const cancelTask = useCancelTask();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-10 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading task...
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-destructive">
        Task not found.
      </div>
    );
  }

  const canCancel = task.status === "TODO" || task.status === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            {task.category ? <Badge variant="outline">{task.category.name}</Badge> : null}
            {task.labels.map((label) => (
              <Badge key={label.id} style={{ backgroundColor: label.color, color: "white" }}>
                {label.name}
              </Badge>
            ))}
            {task.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          {canCancel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelTask.mutate(task.id)}
              disabled={cancelTask.isPending}
            >
              Cancel task
            </Button>
          ) : null}
        </div>
      </div>

      {task.description ? (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{task.description}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-3 text-sm">
          <p className="text-muted-foreground">Due date</p>
          <p className="font-medium">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
          </p>
        </div>
        <div className="rounded-lg border p-3 text-sm">
          <p className="text-muted-foreground">Target time</p>
          <p className="font-medium">{task.targetTime ?? "Not set"}</p>
        </div>
        <div className="rounded-lg border p-3 text-sm">
          <p className="text-muted-foreground">Notifications</p>
          <p className="font-medium">{task.reminder?.enabled ? "On" : "Off"}</p>
        </div>
      </div>

      <TaskTimer task={task} />

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">
          Subtasks {task.subtaskSummary.total > 0 ? `(${task.subtaskSummary.completed}/${task.subtaskSummary.total})` : ""}
        </h2>
        <SubtaskList taskId={task.id} />
      </div>

      <div className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-2">
        <p>Created {new Date(task.createdAt).toLocaleString()}</p>
        <p>Updated {new Date(task.updatedAt).toLocaleString()}</p>
      </div>

      <TaskFormDialog mode="edit" task={task} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}