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

    await createTask.mutateAsync({
      title: trimmed,
      level,
      periodKey: periodKey ?? undefined,
      scheduledDate: scheduledDate ?? undefined,
    });

    setTitle("");
  }

  return (
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
      className="border-dashed"
    />
  );
}