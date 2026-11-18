import type { RichTextDoc } from "@/lib/description";

export type PlanningLevel = "YEAR" | "SIX_MONTH" | "QUARTER" | "MONTH" | "WEEK" | "DAY";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

export interface CategoryDTO {
  id: string;
  name: string;
  color?: string | null;
}

export interface LabelDTO {
  id: string;
  name: string;
  color?: string | null;
}

export interface TagDTO {
  id: string;
  name: string;
  color?: string | null;
}

export interface ReminderDTO {
  id?: string;
  taskId?: string;
  enabled: boolean;
  offsetMinutes: number | null;
  customRemindAt?: string | null;
  remindAt?: string | null;
}

export interface SubtaskSummaryDTO {
  total: number;
  completed: number;
}

export interface SubtaskDTO {
  id: string;
  taskId?: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface TaskDTO {
  id: string;
  userId: string;
  parentId?: string | null;
  level: PlanningLevel;
  periodKey: string | null;
  order?: number;
  title: string;
  description: RichTextDoc | string | null;
  estimatedMinutes: number | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  remindAt: string | null;
  completed: boolean;
  completedAt: string | null;
  sourceTaskId?: string | null;
  sourceLinkType?: "IMPORTED" | "BROKEN_DOWN" | null;
  skippedAt?: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Additional properties for backward compatibility with views and components
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: CategoryDTO | null;
  categoryId?: string | null;
  labels?: LabelDTO[];
  tags?: TagDTO[];
  dueDate?: string | null;
  targetTime?: string | null;
  reminder?: ReminderDTO | null;
  subtasks?: SubtaskDTO[];
  subtaskSummary?: SubtaskSummaryDTO;
  actualSeconds?: number;
  activeTimeEntry?: {
    id: string;
    startedAt: string;
  } | null;
}

export interface LinkPreviewDTO {
  url: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
}
