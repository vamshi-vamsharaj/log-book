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
