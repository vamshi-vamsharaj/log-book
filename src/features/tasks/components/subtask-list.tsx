"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  useCreateSubtask,
  useDeleteSubtask,
  useUpdateSubtask,
} from "@/features/tasks/mutations/use-subtask-mutations";
import { useSubtasks } from "@/features/tasks/queries/use-task";

interface SubtaskListProps {
  taskId: string;
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const { data: subtasks } = useSubtasks(taskId);
  const createSubtask = useCreateSubtask(taskId);
  const updateSubtask = useUpdateSubtask(taskId);
  const deleteSubtask = useDeleteSubtask(taskId);
  const [title, setTitle] = useState("");

  async function handleCreate() {
    if (!title.trim()) {
      return;
    }

    await createSubtask.mutateAsync({ title: title.trim() });
    setTitle("");
  }

  function moveSubtask(index: number, direction: -1 | 1) {
    if (!subtasks) {
      return;
    }

    const current = subtasks[index];
    const target = subtasks[index + direction];

    if (!current || !target) {
      return;
    }

    updateSubtask.mutate({ subtaskId: current.id, input: { order: target.order } });
    updateSubtask.mutate({ subtaskId: target.id, input: { order: current.order } });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add a subtask"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleCreate();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={handleCreate} disabled={createSubtask.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        {(subtasks ?? []).map((subtask, index) => (
          <div key={subtask.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={(checked) =>
                updateSubtask.mutate({ subtaskId: subtask.id, input: { completed: checked === true } })
              }
            />
            <span className={`flex-1 text-sm ${subtask.completed ? "text-muted-foreground line-through" : ""}`}>
              {subtask.title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Move up"
              onClick={() => moveSubtask(index, -1)}
              disabled={index === 0}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Move down"
              onClick={() => moveSubtask(index, 1)}
              disabled={!subtasks || index === subtasks.length - 1}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete subtask"
              onClick={() => deleteSubtask.mutate(subtask.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {(subtasks ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No subtasks yet.</p>
        ) : null}
      </div>
    </div>
  );
}