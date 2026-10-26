"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { useUndo } from "@/contexts/undo-context";
import type { PlanningLevel } from "@/lib/period";
import type { RichTextDoc } from "@/lib/description";

export interface SubtaskDTO {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface TaskDTO {
  id: string;
  userId: string;
  level: PlanningLevel;
  periodKey: string;
  order: number;
  title: string;
  description: RichTextDoc | null;
  completed: boolean;
  completedAt: string | null;
  estimatedMinutes: number | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  remindAt: string | null;
  sourceTaskId: string | null;
  sourceLinkType: "IMPORTED" | "BROKEN_DOWN" | null;
  skippedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: SubtaskDTO[];
}

export interface RecommendationGroup {
  level: PlanningLevel;
  tasks: TaskDTO[];
}

const keys = {
  period: (level: PlanningLevel, periodKey: string) => ["tasks", level, periodKey] as const,
  recommendations: (level: PlanningLevel, periodKey: string) =>
    ["recommendations", level, periodKey] as const,
};

export function usePeriodTasks(level: PlanningLevel, periodKey: string) {
  return useQuery({
    queryKey: keys.period(level, periodKey),
    queryFn: () => api.get<TaskDTO[]>(`/api/tasks?level=${level}&periodKey=${periodKey}`),
  });
}

export function useRecommendations(level: PlanningLevel, periodKey: string) {
  return useQuery({
    queryKey: keys.recommendations(level, periodKey),
    queryFn: () =>
      api.get<RecommendationGroup[]>(`/api/recommendations?level=${level}&periodKey=${periodKey}`),
    enabled: level !== "YEAR",
  });
}

function useInvalidatePeriod() {
  const queryClient = useQueryClient();
  return (level: PlanningLevel, periodKey: string) =>
    queryClient.invalidateQueries({ queryKey: keys.period(level, periodKey) });
}

export function useCreateTask(level: PlanningLevel, periodKey: string) {
  const invalidate = useInvalidatePeriod();
  return useMutation({
    mutationFn: (title: string) => api.post<TaskDTO>("/api/tasks", { title, level, periodKey }),
    onSuccess: () => invalidate(level, periodKey),
  });
}

export function useUpdateTask(level: PlanningLevel, periodKey: string) {
  const invalidate = useInvalidatePeriod();
  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: {
      id: string;
      title?: string;
      completed?: boolean;
      description?: RichTextDoc | null;
      estimatedMinutes?: number | null;
      scheduledDate?: string | null;
      scheduledTime?: string | null;
      remindAt?: string | null;
    }) => api.patch<TaskDTO>(`/api/tasks/${id}`, patch),
    onSuccess: () => invalidate(level, periodKey),
  });
}

export function useDeleteTask(level: PlanningLevel, periodKey: string) {
  const invalidate = useInvalidatePeriod();
  const { registerUndo } = useUndo();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: (_data, id) => {
      invalidate(level, periodKey);
      registerUndo({
        id,
        message: "Task deleted",
        undo: async () => {
          await api.post(`/api/tasks/${id}/restore`);
          invalidate(level, periodKey);
        },
      });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      level,
      periodKey,
    }: {
      id: string;
      level: PlanningLevel;
      periodKey: string;
    }) => api.post<TaskDTO>(`/api/tasks/${id}/move`, { level, periodKey }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useImportTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sourceTaskId,
      level,
      periodKey,
    }: {
      sourceTaskId: string;
      level: PlanningLevel;
      periodKey: string;
    }) => api.post<TaskDTO>("/api/tasks/import", { sourceTaskId, level, periodKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}

export function useBreakDownTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: string;
      items: Array<{ title: string; level: PlanningLevel; periodKey: string; scheduledDate?: string | null }>;
    }) => api.post<TaskDTO[]>(`/api/tasks/${id}/break-down`, { items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCreateSubtask(level: PlanningLevel, periodKey: string) {
  const invalidate = useInvalidatePeriod();
  return useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      api.post<SubtaskDTO>(`/api/tasks/${taskId}/subtasks`, { title }),
    onSuccess: () => invalidate(level, periodKey),
  });
}

export function useUpdateSubtask(level: PlanningLevel, periodKey: string) {
  const invalidate = useInvalidatePeriod();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; title?: string; completed?: boolean }) =>
      api.patch<SubtaskDTO>(`/api/subtasks/${id}`, patch),
    onSuccess: () => invalidate(level, periodKey),
  });
}

export function useDeleteSubtask(level: PlanningLevel, periodKey: string) {
  const invalidate = useInvalidatePeriod();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/subtasks/${id}`),
    onSuccess: () => invalidate(level, periodKey),
  });
}
