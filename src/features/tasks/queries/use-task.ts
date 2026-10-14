"use client";

import { useQuery } from "@tanstack/react-query";

import { taskKeys } from "@/features/tasks/queries/keys";
import type { TaskDTO } from "@/features/tasks/types";

async function fetchTask(id: string): Promise<TaskDTO> {
  const response = await fetch(`/api/tasks/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load task");
  }

  return response.json();
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ""),
    queryFn: () => fetchTask(id as string),
    enabled: Boolean(id),
  });
}

async function fetchSubtasks(taskId: string) {
  const response = await fetch(`/api/tasks/${taskId}/subtasks`);

  if (!response.ok) {
    throw new Error("Failed to load subtasks");
  }

  return response.json() as Promise<{ id: string; title: string; completed: boolean; order: number }[]>;
}

export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: [...taskKeys.detail(taskId), "subtasks"],
    queryFn: () => fetchSubtasks(taskId),
    enabled: Boolean(taskId),
  });
}
