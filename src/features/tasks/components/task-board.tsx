"use client";

import { useState } from "react";

import { DaySuggestions } from "@/features/tasks/components/day-suggestions";
import { PeriodNavigator } from "@/features/tasks/components/period-navigator";
import { QuickAdd } from "@/features/tasks/components/quick-add";
import { TaskItem } from "@/features/tasks/components/task-item";
import { TaskPeek } from "@/features/tasks/components/task-peek";
import { useTasks } from "@/features/tasks/queries/use-tasks";
import { getDayKey, getPeriodKey, type PlanningLevel } from "@/lib/period";

interface TaskBoardProps {
  level: PlanningLevel;
}

export function TaskBoard({ level }: TaskBoardProps) {
  const [date, setDate] = useState(() => new Date());
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const periodKey = getPeriodKey(level, date);
  const { data: tasks, isLoading } = useTasks(
    level === "DAY" ? { level, scheduledOnly: true } : { level, periodKey },
  );

  const dayTasks =
    level === "DAY" ? (tasks ?? []).filter((task) => task.scheduledDate?.slice(0, 10) === getDayKey(date)) : tasks ?? [];

  return (
    <div className="space-y-4">
      <PeriodNavigator level={level} date={date} onChange={setDate} onToday={() => setDate(new Date())} />

      <QuickAdd
        level={level}
        periodKey={level === "DAY" ? undefined : periodKey}
        scheduledDate={level === "DAY" ? date : undefined}
        placeholder={level === "DAY" ? "Add a task for today..." : "Add a plan for this period..."}
      />

      {level === "DAY" ? <DaySuggestions date={date} /> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-1">
          {dayTasks.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nothing planned yet.
            </p>
          ) : (
            dayTasks.map((task) => <TaskItem key={task.id} task={task} onOpen={setOpenTaskId} />)
          )}
        </div>
      )}

      <TaskPeek taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </div>
  );
}