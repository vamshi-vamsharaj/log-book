import type { TaskTimeEntry } from "@prisma/client";

export function computeClosedDurationSeconds(entries: TaskTimeEntry[]): number {
  return entries.reduce((total, entry) => total + (entry.durationSeconds ?? 0), 0);
}

export function findActiveEntry(entries: TaskTimeEntry[]): TaskTimeEntry | null {
  return entries.find((entry) => entry.endedAt === null) ?? null;
}

export function computeActualSeconds(entries: TaskTimeEntry[], now: Date = new Date()): number {
  const closed = computeClosedDurationSeconds(entries.filter((entry) => entry.endedAt !== null));
  const active = findActiveEntry(entries);

  if (!active) {
    return closed;
  }

  const liveSeconds = Math.max(
    0,
    Math.floor((now.getTime() - active.startedAt.getTime()) / 1000),
  );

  return closed + liveSeconds;
}

export function secondsBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}

export function combineDueDateAndTargetTime(
  dueDate: Date | null,
  targetTime: string | null,
): Date | null {
  if (!dueDate) {
    return null;
  }

  if (!targetTime) {
    return dueDate;
  }

  const [hoursStr, minutesStr] = targetTime.split(":");
  const hours = Number(hoursStr || 0);
  const minutes = Number(minutesStr || 0);
  const combined = new Date(dueDate);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}