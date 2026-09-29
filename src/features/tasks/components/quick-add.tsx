"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/features/tasks/mutations/use-task-mutations";
import type { PlanningLevel } from "@/features/tasks/types";

interface QuickAddProps {
  level: PlanningLevel;
  periodKey?: string | null;
  scheduledDate?: Date | null;
  placeholder?: string;
}

export function QuickAdd({ level, periodKey, scheduledDate, placeholder }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();

  async function handleSubmit() {
    const trimmed = title.trim();

    if (!trimmed) {
      return;
    }

    try {
      await createTask.mutateAsync({
        title: trimmed,
        level,
        periodKey: periodKey ?? undefined,
        scheduledDate: scheduledDate ?? undefined,
      });
      setTitle("");
    } catch {
      // error is surfaced below via createTask.error
    }
  }

  return (
    <div className="space-y-1">
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder ?? "Add a task and press Enter..."}
        disabled={createTask.isPending}
        className="border-dashed"
      />
      {createTask.isError ? (
        <p className="text-xs font-medium text-destructive">{createTask.error.message}</p>
      ) : null}
    </div>
  );
}
