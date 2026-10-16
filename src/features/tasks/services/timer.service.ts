/** Timer service — placeholder until timer functionality is implemented. */

import type { TimeEntry } from "@/features/tasks/repositories/timer.repository";

export interface TimerState {
  entries: TimeEntry[];
  active: TimeEntry | null;
}

export async function getTimerState(_userId: string, _taskId: string): Promise<TimerState> {
  return { entries: [], active: null };
}

export async function startTimer(_userId: string, _taskId: string): Promise<TimeEntry | null> {
  return null;
}

export async function pauseTimer(_userId: string, _taskId: string): Promise<TimeEntry | null> {
  return null;
}

export async function stopTimer(_userId: string, _taskId: string): Promise<TimeEntry | null> {
  return null;
}

export async function resumeTimer(_userId: string, _taskId: string): Promise<TimeEntry | null> {
  return null;
}