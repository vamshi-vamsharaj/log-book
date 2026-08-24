"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/tasks/queries/use-taxonomy";
import type { ListTasksQuery } from "@/features/tasks/schemas/task.schema";

interface TaskFiltersProps {
  filters: Partial<ListTasksQuery>;
  onChange: (filters: Partial<ListTasksQuery>) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const { data: categories } = useCategories();
  const [search, setSearch] = useState(filters.search ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      onChange({ ...filters, search: search || undefined, page: 1 });
    }, 350);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search tasks..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-56"
        aria-label="Search tasks"
      />
      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(value) =>
          onChange({ ...filters, status: value === "ALL" ? undefined : (value as never), page: 1 })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="TODO">To do</SelectItem>
          <SelectItem value="IN_PROGRESS">In progress</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.priority ?? "ALL"}
        onValueChange={(value) =>
          onChange({ ...filters, priority: value === "ALL" ? undefined : (value as never), page: 1 })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All priorities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.categoryId ?? "ALL"}
        onValueChange={(value) =>
          onChange({ ...filters, categoryId: value === "ALL" ? undefined : value, page: 1 })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All categories</SelectItem>
          {(categories ?? []).map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.sortBy ?? "createdAt"}
        onValueChange={(value) => onChange({ ...filters, sortBy: value as never })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created</SelectItem>
          <SelectItem value="updatedAt">Updated</SelectItem>
          <SelectItem value="dueDate">Due date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="estimatedMinutes">Estimated duration</SelectItem>
          <SelectItem value="actualDuration">Actual duration</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onChange({ ...filters, sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })
        }
      >
        {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSearch("");
          onChange({ archived: false, sortBy: "createdAt", sortOrder: "desc", page: 1, limit: 20 });
        }}
      >
        Reset
      </Button>
    </div>
  );
}