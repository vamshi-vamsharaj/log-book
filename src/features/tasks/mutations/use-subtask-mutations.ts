"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateSubtaskInput, UpdateSubtaskInput } from "@/features/tasks/schemas/subtask.schema";
import { taskKeys } from "@/features/tasks/queries/keys";

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

export function useCreateSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubtaskInput) =>
      requestJson(`/api/tasks/${taskId}/subtasks`, "POST", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

export function useUpdateSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subtaskId, input }: { subtaskId: string; input: UpdateSubtaskInput }) =>
      requestJson(`/api/tasks/${taskId}/subtasks/${subtaskId}`, "PATCH", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

export function useDeleteSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subtaskId: string) =>
      requestJson(`/api/tasks/${taskId}/subtasks/${subtaskId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}