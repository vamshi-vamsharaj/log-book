"use client";

import { useMemo, useState } from "react";

import { QuickAdd } from "@/features/tasks/components/quick-add";
import { TaskItem } from "@/features/tasks/components/task-item";
import { TaskPeek } from "@/features/tasks/components/task-peek";
import {
  usePeriodTasks,
  type TaskDTO,
} from "@/features/tasks/hooks/use-planner-tasks";
import { localDateKey, periodKeyFor } from "@/lib/period";

export function TaskBacklog() {
  const todayKey = localDateKey(new Date());
  const weekKey = periodKeyFor("WEEK", todayKey);

  // Fetch all DAY-level tasks for the current week to power the backlog
  const { data: tasks, isLoading } = usePeriodTasks("DAY", todayKey);
  const [openTask, setOpenTask] = useState<TaskDTO | null>(null);

  const groups = useMemo(() => {
    const today = new Date();
    const todayStr = localDateKey(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = localDateKey(tomorrow);

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

      if (key === todayStr) {
        result.today.push(task);
      } else if (key === tomorrowStr) {
        result.tomorrow.push(task);
      } else if (key > todayStr) {
        result.upcoming.push(task);
      } else {
        result.today.push(task);
      }
    });

    return result;
  }, [tasks]);

  function handleOpen(id: string) {
    const task = (tasks ?? []).find((t) => t.id === id) ?? null;
    setOpenTask(task);
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  return (
    <div className="space-y-6">
      <QuickAdd level="DAY" placeholder="Capture a task..." />

      <Section title="Today" tasks={groups.today} onOpen={handleOpen} />
      <Section title="Tomorrow" tasks={groups.tomorrow} onOpen={handleOpen} />
      <Section title="Unscheduled" tasks={groups.unscheduled} onOpen={handleOpen} />
      <Section title="Upcoming" tasks={groups.upcoming} onOpen={handleOpen} />

      <TaskPeek
        task={openTask}
        level="DAY"
        periodKey={weekKey}
        onClose={() => setOpenTask(null)}
      />
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
