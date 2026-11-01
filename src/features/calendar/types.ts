import type { TaskDTO } from "@/features/tasks/hooks/use-planner-tasks";

export type CalendarView = "month" | "week" | "day" | "agenda";

export interface CalendarTask extends TaskDTO {
  /** True when scheduledDate < today and the task is still incomplete */
  isCarriedForward: boolean;
  /** The original scheduledDate string from the task record */
  originalDate: string;
}

export interface CalendarDayData {
  dateKey: string; // "YYYY-MM-DD"
  tasks: CalendarTask[];
}
