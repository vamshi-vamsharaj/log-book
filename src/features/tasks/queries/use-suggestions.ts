"use client";

import { useQuery } from "@tanstack/react-query";

import { getDayKey } from "@/lib/period";
import { taskKeys } from "@/features/tasks/queries/keys";
import type { TaskDTO } from "@/features/tasks/types";

async function fetchSuggestions(date: Date): Promise<TaskDTO[]> {
  const response = await fetch(`/api/tasks/suggestions?date=${date.toISOString()}`);

  if (!response.ok) {
    throw new Error("Failed to load suggestions");
  }

  return response.json();
}

export function useWeekSuggestions(date: Date) {
  return useQuery({
    queryKey: taskKeys.suggestions(getDayKey(date)),
    queryFn: () => fetchSuggestions(date),
  });
}