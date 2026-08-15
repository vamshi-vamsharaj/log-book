"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { TaskRow } from "@/features/tasks/components/task-row";
import { useTasks } from "@/features/tasks/queries/use-tasks";
import type { ListTasksQuery } from "@/features/tasks/schemas/task.schema";

const DEFAULT_FILTERS: Partial<ListTasksQuery> = {
  archived: false,
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};

export function TaskList() {
  const [filters, setFilters] = useState<Partial<ListTasksQuery>>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading, isError } = useTasks(filters);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilters filters={filters} onChange={setFilters} />
        <Button size="sm" onClick={() => setFormOpen(true)}>
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

      {data && data.tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No tasks match your filters yet.
        </div>
      ) : null}

      {data && data.tasks.length > 0 ? (
        <div className="space-y-2">
          {data.tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      ) : null}

      {data && data.total > limit ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {data.total} tasks
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

      <TaskFormDialog mode="create" open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}