"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useUndo } from "@/contexts/undo-context";
import { taskKeys } from "@/features/tasks/queries/keys";
import type {
  CreateTaskInput,
  DeriveTaskInput,
  UpdateTaskInput,
} from "@/features/tasks/schemas/task.schema";
import type { TaskDTO } from "@/features/tasks/types";

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

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => requestJson<TaskDTO>("/api/tasks", "POST", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      requestJson<TaskDTO>(`/api/tasks/${id}`, "PATCH", input),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
    },
  });
}

export function useToggleComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      requestJson<TaskDTO>(`/api/tasks/${id}/${completed ? "complete" : "reopen"}`, "POST"),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = queryClient.getQueriesData<TaskDTO[]>({ queryKey: taskKeys.lists() });

      previousLists.forEach(([key, tasks]) => {
        if (!tasks) return;
        queryClient.setQueryData(
          key,
          tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
        );
      });

      return { previousLists };
    },
    onError: (_error, _vars, context) => {
      context?.previousLists.forEach(([key, tasks]) => {
        queryClient.setQueryData(key, tasks);
      });
    },
    onSettled: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      if (task) {
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { registerUndo } = useUndo();

  return useMutation({
    mutationFn: (id: string) => requestJson(`/api/tasks/${id}`, "DELETE"),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

      registerUndo({
        id,
        message: "Task deleted",
        undo: async () => {
          await requestJson(`/api/tasks/${id}/restore`, "POST");
          queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
      });
    },
  });
}

export function useDeriveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, input }: { parentId: string; input: DeriveTaskInput }) =>
      requestJson<TaskDTO>(`/api/tasks/${parentId}/derive`, "POST", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}