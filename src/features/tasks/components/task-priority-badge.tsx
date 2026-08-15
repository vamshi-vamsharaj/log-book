import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/features/tasks/types";

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  LOW: "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  HIGH: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  URGENT: "border-transparent bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={cn(PRIORITY_STYLE[priority])}>{PRIORITY_LABEL[priority]}</Badge>;
}