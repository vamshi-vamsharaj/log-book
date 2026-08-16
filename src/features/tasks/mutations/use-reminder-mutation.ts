"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { taskKeys } from "@/features/tasks/queries/keys";
import type { UpdateReminderInput } from "@/features/tasks/schemas/reminder.schema";

async function requestJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "Request failed");
  }

  return response.json();
}

export function useSetReminder(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateReminderInput) =>
      requestJson(`/api/tasks/${taskId}/reminder`, "PUT", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.reminder(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}