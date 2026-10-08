"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { BreakDownDialog } from "@/features/tasks/components/break-down-dialog";
import { MoveMenu } from "@/features/tasks/components/move-menu";
import { PeriodHeader } from "@/features/tasks/components/period-header";
import { RecommendationsPanel } from "@/features/tasks/components/recommendations-panel";
import { TaskPeek } from "@/features/tasks/components/task-peek";
import { TaskRow } from "@/features/tasks/components/task-row";
import {
  useCreateTask,
  useDeleteTask,
  usePeriodTasks,
  useUpdateTask,
  type TaskDTO,
} from "@/features/tasks/hooks/use-planner-tasks";
import { LEVEL_TO_SLUG, currentPeriodKey, localDateKey, type PlanningLevel } from "@/lib/period";

interface PlannerViewProps {
  level: PlanningLevel;
  periodKey: string;
}

const LEVEL_COPY: Record<PlanningLevel, string> = {
  YEAR: "What do you want this year to add up to?",
  SIX_MONTH: "What matters over this stretch?",
  QUARTER: "What are you aiming to ship this quarter?",
  MONTH: "What's the focus for this month?",
  WEEK: "What are you committing to this week?",
  DAY: "What are you actually working on today?",
};

function RowSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2">
      <div className="h-[18px] w-[18px] shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function PlannerView({ level, periodKey }: PlannerViewProps) {
  const router = useRouter();
  const today = localDateKey();
  const todayKey = currentPeriodKey(level, today);

  const { data: tasks, isLoading, isError } = usePeriodTasks(level, periodKey);
  const createTask = useCreateTask(level, periodKey);
  const updateTask = useUpdateTask(level, periodKey);
  const deleteTask = useDeleteTask(level, periodKey);

  const [quickAdd, setQuickAdd] = useState("");
  const [openTask, setOpenTask] = useState<TaskDTO | null>(null);
  const [breakDownTaskId, setBreakDownTaskId] = useState<string | null>(null);

  function navigate(nextPeriodKey: string) {
    router.push(`/planner/${LEVEL_TO_SLUG[level]}?period=${nextPeriodKey}`);
  }

  async function handleQuickAdd() {
    const trimmed = quickAdd.trim();
    if (!trimmed) return;
    setQuickAdd("");
    await createTask.mutateAsync(trimmed);
  }

  const activeTasks = (tasks ?? []).filter((t) => !t.completed);
  const completedTasks = (tasks ?? []).filter((t) => t.completed);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
      <PeriodHeader level={level} periodKey={periodKey} todayKey={todayKey} onNavigate={navigate} />
      <p className="-mt-2 text-sm text-muted-foreground">{LEVEL_COPY[level]}</p>

      <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-border/70 px-2.5 py-2 transition-colors focus-within:border-primary/50 focus-within:bg-accent/20">
        <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleQuickAdd();
            }
          }}
          placeholder="Add a task — just the title is enough"
          disabled={createTask.isPending}
          className="h-7 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
      {createTask.isError ? (
        <p className="text-xs font-medium text-destructive">{createTask.error.message}</p>
      ) : null}

      {level !== "YEAR" ? <RecommendationsPanel level={level} periodKey={periodKey} /> : null}

      {isLoading ? (
        <div className="space-y-1">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-lg border border-dashed border-destructive/40 p-6 text-center text-sm text-destructive">
          Couldn&apos;t load this planner. Try refreshing.
        </p>
      ) : null}

      {!isLoading && !isError && activeTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-10 text-center">
          <p className="text-sm text-muted-foreground">Nothing here yet. Add your first task above.</p>
        </div>
      ) : null}

      {activeTasks.length > 0 ? (
        <div className="space-y-0.5">
          {activeTasks.map((task) => (
            <TaskRowWithActions
              key={task.id}
              task={task}
              level={level}
              onToggleComplete={(id, completed) => updateTask.mutate({ id, completed })}
              onTitleCommit={(id, title) => updateTask.mutate({ id, title })}
              onOpen={setOpenTask}
              onBreakDown={() => setBreakDownTaskId(task.id)}
              onDelete={() => deleteTask.mutate(task.id)}
            />
          ))}
        </div>
      ) : null}

      {completedTasks.length > 0 ? (
        <details className="group">
          <summary className="cursor-pointer select-none text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            {completedTasks.length} completed
          </summary>
          <div className="mt-1 space-y-0.5">
            {completedTasks.map((task) => (
              <TaskRowWithActions
                key={task.id}
                task={task}
                level={level}
                onToggleComplete={(id, completed) => updateTask.mutate({ id, completed })}
                onTitleCommit={(id, title) => updateTask.mutate({ id, title })}
                onOpen={setOpenTask}
                onBreakDown={() => setBreakDownTaskId(task.id)}
                onDelete={() => deleteTask.mutate(task.id)}
              />
            ))}
          </div>
        </details>
      ) : null}

      <TaskPeek task={openTask} level={level} periodKey={periodKey} onClose={() => setOpenTask(null)} />
      <BreakDownDialog
        taskId={breakDownTaskId}
        defaultLevel="DAY"
        onClose={() => setBreakDownTaskId(null)}
      />
    </div>
  );
}

/** Wraps TaskRow + MoveMenu in a single flex row so the menu trigger is a
 * normal flex child (not an absolutely-positioned overlay) — it only ever
 * reserves space it actually occupies, so it can never sit on top of other
 * interactive content in the row. */
function TaskRowWithActions({
  task,
  level,
  onToggleComplete,
  onTitleCommit,
  onOpen,
  onBreakDown,
  onDelete,
}: {
  task: TaskDTO;
  level: PlanningLevel;
  onToggleComplete: (id: string, completed: boolean) => void;
  onTitleCommit: (id: string, title: string) => void;
  onOpen: (task: TaskDTO) => void;
  onBreakDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group/row flex items-center">
      <div className="min-w-0 flex-1">
        <TaskRow task={task} onToggleComplete={onToggleComplete} onTitleCommit={onTitleCommit} onOpen={onOpen} />
      </div>
      <MoveMenu taskId={task.id} currentLevel={level} onBreakDown={onBreakDown} onDelete={onDelete} />
    </div>
  );
}
