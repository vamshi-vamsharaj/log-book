"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { taskKeys } from "@/features/tasks/queries/keys";

async function postTimerAction(taskId: string, action: string) {
  const response = await fetch(`/api/tasks/${taskId}/timer/${action}`, { method: "POST" });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "Timer action failed");
  }

  return response.json();
}

function useTimerAction(action: "start" | "pause" | "resume" | "stop") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => postTimerAction(taskId, action),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.timer(taskId) });
    },
  });
}

export function useStartTimer() {
  return useTimerAction("start");
}

export function usePauseTimer() {
  return useTimerAction("pause");
}

export function useResumeTimer() {
  return useTimerAction("resume");
}

export function useStopTimer() {
  return useTimerAction("stop");
}