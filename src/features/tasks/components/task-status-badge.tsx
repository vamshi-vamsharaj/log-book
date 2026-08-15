import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/features/tasks/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

const STATUS_VARIANT: Record<TaskStatus, "default" | "secondary" | "outline" | "destructive"> = {
  TODO: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  ARCHIVED: "outline",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}