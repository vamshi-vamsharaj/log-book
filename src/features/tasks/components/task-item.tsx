"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { formatDurationMinutes } from "@/features/tasks/utils/duration";
import { useToggleComplete, useUpdateTask } from "@/features/tasks/mutations/use-task-mutations";
import { TaskCheckbox } from "@/features/tasks/components/task-checkbox";
import type { TaskDTO } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: TaskDTO;
  onOpen: (id: string) => void;
}

export function TaskItem({ task, onOpen }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const toggleComplete = useToggleComplete();
  const updateTask = useUpdateTask();

  function commitTitle() {
    setEditing(false);
    const trimmed = title.trim();

    if (!trimmed || trimmed === task.title) {
      setTitle(task.title);
      return;
    }

    updateTask.mutate({ id: task.id, input: { title: trimmed } });
  }

  return (
    <div
      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
      onClick={() => !editing && onOpen(task.id)}
    >
      <TaskCheckbox
        checked={task.completed}
        onToggle={() => toggleComplete.mutate({ id: task.id, completed: !task.completed })}
      />
      {editing ? (
        <Input
          autoFocus
          value={title}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitTitle();
            }
            if (event.key === "Escape") {
              setTitle(task.title);
              setEditing(false);
            }
          }}
          className="h-7 flex-1"
        />
      ) : (
        <span
          onClick={(event) => {
            event.stopPropagation();
            setEditing(true);
          }}
          className={cn(
            "flex-1 truncate text-sm",
            task.completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
      )}
      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        {task.scheduledDate ? (
          <span>{new Date(task.scheduledDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        ) : null}
        {task.scheduledTime ? <span>{task.scheduledTime}</span> : null}
        {task.estimatedMinutes ? <span>{formatDurationMinutes(task.estimatedMinutes)}</span> : null}
      </div>
    </div>
  );
}