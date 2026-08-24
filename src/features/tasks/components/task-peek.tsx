"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskCheckbox } from "@/features/tasks/components/task-checkbox";
import { DescriptionEditor } from "@/features/tasks/components/description-editor";
import {
  useDeleteTask,
  useToggleComplete,
  useUpdateTask,
} from "@/features/tasks/mutations/use-task-mutations";
import { useTask } from "@/features/tasks/queries/use-task";
import { formatDurationMinutes, parseDurationInput } from "@/features/tasks/utils/duration";

interface TaskPeekProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskPeek({ taskId, onClose }: TaskPeekProps) {
  const { data: task } = useTask(taskId);
  const updateTask = useUpdateTask();
  const toggleComplete = useToggleComplete();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedInput, setEstimatedInput] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [remindAt, setRemindAt] = useState("");

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setEstimatedInput(task.estimatedMinutes ? formatDurationMinutes(task.estimatedMinutes) : "");
    setScheduledDate(task.scheduledDate ? task.scheduledDate.slice(0, 10) : "");
    setScheduledTime(task.scheduledTime ?? "");
    setRemindAt(task.remindAt ? task.remindAt.slice(0, 16) : "");
  }, [task]);

  if (!task) {
    return null;
  }

  function commitField(input: Record<string, unknown>) {
    if (!task) return;
    updateTask.mutate({ id: task.id, input });
  }

  function commitTitle() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task?.title) {
      setTitle(task?.title ?? "");
      return;
    }
    commitField({ title: trimmed });
  }

  function commitDescription() {
    if (description === (task?.description ?? "")) return;
    commitField({ description: description || null });
  }

  function commitEstimated() {
    const minutes = estimatedInput.trim() ? parseDurationInput(estimatedInput) : null;
    commitField({ estimatedMinutes: minutes });
    setEstimatedInput(minutes ? formatDurationMinutes(minutes) : "");
  }

  function commitScheduledDate(value: string) {
    setScheduledDate(value);
    commitField({ scheduledDate: value ? new Date(value) : null });
  }

  function commitScheduledTime(value: string) {
    setScheduledTime(value);
    commitField({ scheduledTime: value || null });
  }

  function commitRemindAt(value: string) {
    setRemindAt(value);
    commitField({ remindAt: value ? new Date(value) : null });
  }

  return (
    <Dialog open={Boolean(taskId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Task detail</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3">
          <TaskCheckbox
            checked={task.completed}
            onToggle={() => toggleComplete.mutate({ id: task.id, completed: !task.completed })}
          />
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitTitle();
              }
            }}
            className="h-8 flex-1 border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Description</Label>
            <DescriptionEditor
              value={description}
              onChange={setDescription}
              onBlur={commitDescription}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Estimated</Label>
              <Input
                placeholder="1h 30m"
                value={estimatedInput}
                onChange={(event) => setEstimatedInput(event.target.value)}
                onBlur={commitEstimated}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(event) => commitScheduledDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(event) => commitScheduledTime(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Remind me</Label>
            <Input
              type="datetime-local"
              value={remindAt}
              onChange={(event) => commitRemindAt(event.target.value)}
            />
          </div>

          <div className="space-y-1.5 rounded-lg border p-3">
            <Label className="text-muted-foreground">Work history</Label>
            <p className="text-xs text-muted-foreground">
              Work sessions are coming in a future phase.
            </p>
            <Button size="sm" variant="outline" disabled>
              Start
            </Button>
          </div>

          <div className="flex justify-end border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                deleteTask.mutate(task.id);
                onClose();
              }}
            >
              Delete task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}