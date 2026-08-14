"use client";

import { useQuery } from "@tanstack/react-query";

import { taskKeys } from "@/features/tasks/queries/keys";
import type { ListTasksQuery } from "@/features/tasks/schemas/task.schema";
import type { TaskDTO } from "@/features/tasks/types";

async function fetchTasks(query: Partial<ListTasksQuery>): Promise<TaskDTO[]> {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/tasks?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  return response.json();
}

export function useTasks(query: Partial<ListTasksQuery>) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => fetchTasks(query),
  });
}