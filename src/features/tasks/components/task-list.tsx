"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { TaskRow } from "@/features/tasks/components/task-row";
import { useToggleComplete, useUpdateTask } from "@/features/tasks/mutations/use-task-mutations";
import { useTasks } from "@/features/tasks/queries/use-tasks";
import type { ListTasksQuery } from "@/features/tasks/schemas/task.schema";
import type { TaskDTO } from "@/features/tasks/types";
import type { TaskDTO as PlannerTaskDTO } from "@/features/tasks/hooks/use-planner-tasks";

const DEFAULT_FILTERS: Partial<ListTasksQuery> = {
  archived: false,
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};

function toPlannerTask(task: TaskDTO): PlannerTaskDTO {
  return {
    id: task.id,
    userId: task.userId,
    level: task.level,
    periodKey: task.periodKey ?? "",
    order: task.order ?? 0,
    title: task.title,
    description: typeof task.description === "object" ? task.description : null,
    completed: task.completed,
    completedAt: task.completedAt,
    estimatedMinutes: task.estimatedMinutes,
    scheduledDate: task.scheduledDate,
    scheduledTime: task.scheduledTime,
    remindAt: task.remindAt,
    sourceTaskId: task.sourceTaskId ?? null,
    sourceLinkType: task.sourceLinkType ?? null,
    skippedAt: task.skippedAt ?? null,
    deletedAt: task.deletedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    subtasks: (task.subtasks ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
      order: s.order,
    })),
  };
}

export function TaskList() {
  const [filters, setFilters] = useState<Partial<ListTasksQuery>>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);

  const { data, isLoading, isError } = useTasks(filters);
  const toggleComplete = useToggleComplete();
  const updateTask = useUpdateTask();

  const tasks: TaskDTO[] = Array.isArray(data) ? data : [];
  const total = tasks.length;
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagedTasks = tasks.slice((page - 1) * limit, page * limit);

  function handleOpenCreate() {
    setSelectedTask(null);
    setFormOpen(true);
  }

  function handleOpenEdit(task: TaskDTO) {
    setSelectedTask(task);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilters filters={filters} onChange={setFilters} />
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          New task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-10 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading tasks...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-destructive">
          Failed to load tasks.
        </div>
      ) : null}

      {!isLoading && !isError && tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No tasks match your filters yet.
        </div>
      ) : null}

      {!isLoading && !isError && tasks.length > 0 ? (
        <div className="space-y-2">
          {pagedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={toPlannerTask(task)}
              onToggleComplete={(id, completed) => toggleComplete.mutate({ id, completed })}
              onTitleCommit={(id, title) => updateTask.mutate({ id, input: { title } })}
              onOpen={() => handleOpenEdit(task)}
            />
          ))}
        </div>
      ) : null}

      {total > limit ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {total} tasks
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <TaskFormDialog
        mode={selectedTask ? "edit" : "create"}
        task={selectedTask ?? undefined}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}