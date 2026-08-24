export type PlanningLevel = "YEAR" | "SIX_MONTH" | "QUARTER" | "MONTH" | "WEEK" | "DAY";

export interface TaskDTO {
  id: string;
  userId: string;
  parentId: string | null;
  level: PlanningLevel;
  periodKey: string | null;
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  remindAt: string | null;
  completed: boolean;
  completedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkPreviewDTO {
  url: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
}