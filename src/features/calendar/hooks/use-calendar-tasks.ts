"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { useUndo } from "@/contexts/undo-context";
import type { TaskDTO } from "@/features/tasks/hooks/use-planner-tasks";

export interface CalendarTaskDTO extends TaskDTO {
  isCarriedForward: boolean;
  originalDate: string;
}

const calendarKeys = {
  range: (start: string, end: string) => ["calendar", "tasks", start, end] as const,
};

export function useCalendarTasks(startDate: string, endDate: string) {
  return useQuery({
    queryKey: calendarKeys.range(startDate, endDate),
    queryFn: () =>
      api.get<CalendarTaskDTO[]>(`/api/calendar/tasks?start=${startDate}&end=${endDate}`),
    enabled: Boolean(startDate && endDate),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useCalendarUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...patch
    }: {
      id: string;
      completed?: boolean;
      scheduledDate?: string | null;
      scheduledTime?: string | null;
      title?: string;
      estimatedMinutes?: number | null;
    }) => api.patch<TaskDTO>(`/api/tasks/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCalendarDeleteTask() {
  const queryClient = useQueryClient();
  const { registerUndo } = useUndo();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      registerUndo({
        id,
        message: "Task deleted",
        undo: async () => {
          await api.post(`/api/tasks/${id}/restore`);
          queryClient.invalidateQueries({ queryKey: ["calendar"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
      });
    },
  });
}

export function useSkipTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<TaskDTO>(`/api/tasks/${id}/skip`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUnskipTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<TaskDTO>(`/api/tasks/${id}/unskip`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCalendarCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      scheduledDate,
      scheduledTime,
    }: {
      title: string;
      scheduledDate: string;
      scheduledTime?: string;
    }) =>
      api.post<TaskDTO>("/api/tasks", {
        title,
        level: "DAY",
        periodKey: scheduledDate,
        scheduledDate,
        scheduledTime: scheduledTime || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
