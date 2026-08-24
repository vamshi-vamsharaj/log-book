"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/features/tasks/components/task-form";
import type { TaskDTO } from "@/features/tasks/types";

interface TaskFormDialogProps {
  mode: "create" | "edit";
  task?: TaskDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskFormDialog({ mode, task, open, onOpenChange }: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New task" : "Edit task"}</DialogTitle>
        </DialogHeader>
        <TaskForm task={task} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}