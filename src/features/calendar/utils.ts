import { addDays, localDateKey, periodKeyFor, weekdayIndex } from "@/lib/period";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const FULL_WEEKDAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Returns a date range for a month view — always 6 weeks. */
export function getMonthGrid(year: number, month: number): string[] {
  // month is 1-indexed
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const firstDateKey = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;

  // ISO weekday index of the first day (0=Mon, 6=Sun)
  const startDow = weekdayIndex(firstDateKey);

  // Start grid from the Monday of the first week
  const gridStart = addDays(firstDateKey, -startDow);

  // Always render 6 weeks (42 days) for a stable layout
  const dates: string[] = [];
  for (let i = 0; i < 42; i++) {
    dates.push(addDays(gridStart, i));
  }
  return dates;
}

/** Returns all 7 days of the ISO week containing `dateKey`. */
export function getWeekDays(dateKey: string): string[] {
  const dow = weekdayIndex(dateKey);
  const monday = addDays(dateKey, -dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** "YYYY-MM-DD" → { year, month (1-indexed), day } */
export function parseDateParts(dateKey: string) {
  const parts = dateKey.split("-");
  return {
    year: Number(parts[0]),
    month: Number(parts[1]),
    day: Number(parts[2]),
  };
}

/** Today's date key ("YYYY-MM-DD"). */
export { localDateKey as todayKey };

/** Group tasks by scheduledDate for O(1) day-lookup. */
export function groupTasksByDate(
  tasks: CalendarTaskDTO[],
  today: string,
): Map<string, CalendarTaskDTO[]> {
  const map = new Map<string, CalendarTaskDTO[]>();
  for (const task of tasks) {
    // Carried-forward tasks appear on today (and every future day in range)
    // but we always anchor them to the current view day handled by the caller.
    const dateKey = task.isCarriedForward
      ? today // render on today so the caller can decide placement
      : (task.scheduledDate ?? "");
    if (!dateKey) continue;
    const list = map.get(dateKey) ?? [];
    list.push(task);
    map.set(dateKey, list);
  }
  return map;
}

/** Returns tasks visible on a given day: those originally scheduled for that day +
 *  carried-forward uncompleted tasks that appear on today. */
export function getTasksForDay(
  tasks: CalendarTaskDTO[],
  dateKey: string,
  today: string,
): CalendarTaskDTO[] {
  return tasks.filter((task) => {
    if (!task.scheduledDate) return false;
    // 1. Task originally scheduled for this date
    if (task.scheduledDate === dateKey) return true;
    // 2. Carried-forward task: appears on TODAY (the active day needing attention)
    //    if originally scheduled before today and not yet completed or skipped
    if (task.isCarriedForward && dateKey === today && !task.completed && !task.skippedAt) {
      return true;
    }
    return false;
  });
}

/** Format time from "HH:mm" to "h:mm AM/PM" */
export function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Format duration in minutes to human-readable "1h 30m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
