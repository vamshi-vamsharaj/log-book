"use client";

import { useMemo, useState } from "react";

import { QuickAdd } from "@/features/tasks/components/quick-add";
import { TaskItem } from "@/features/tasks/components/task-item";
import { TaskPeek } from "@/features/tasks/components/task-peek";
import { useTasks } from "@/features/tasks/queries/use-tasks";
import { getDayKey } from "@/lib/period";
import type { TaskDTO } from "@/features/tasks/types";

export function TaskBacklog() {
  const { data: tasks, isLoading } = useTasks({ level: "DAY" });
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const todayKey = getDayKey(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = getDayKey(tomorrow);

    const result = {
      today: [] as TaskDTO[],
      tomorrow: [] as TaskDTO[],
      unscheduled: [] as TaskDTO[],
      upcoming: [] as TaskDTO[],
    };

    (tasks ?? []).forEach((task) => {
      if (!task.scheduledDate) {
        result.unscheduled.push(task);
        return;
      }

      const key = task.scheduledDate.slice(0, 10);

      if (key === todayKey) {
        result.today.push(task);
      } else if (key === tomorrowKey) {
        result.tomorrow.push(task);
      } else if (key > todayKey) {
        result.upcoming.push(task);
      } else {
        result.today.push(task);
      }
    });

    return result;
  }, [tasks]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  return (
    <div className="space-y-6">
      <QuickAdd level="DAY" placeholder="Capture a task..." />

      <Section title="Today" tasks={groups.today} onOpen={setOpenTaskId} />
      <Section title="Tomorrow" tasks={groups.tomorrow} onOpen={setOpenTaskId} />
      <Section title="Unscheduled" tasks={groups.unscheduled} onOpen={setOpenTaskId} />
      <Section title="Upcoming" tasks={groups.upcoming} onOpen={setOpenTaskId} />

      <TaskPeek taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </div>
  );
}

function Section({
  title,
  tasks,
  onOpen,
}: {
  title: string;
  tasks: TaskDTO[];
  onOpen: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}