"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBreakDownTask } from "@/features/tasks/hooks/use-planner-tasks";
import {
  PLANNING_LEVELS,
  currentPeriodKey,
  levelLabel,
  localDateKey,
  type PlanningLevel,
} from "@/lib/period";

interface BreakDownDialogProps {
  taskId: string | null;
  defaultLevel: PlanningLevel;
  onClose: () => void;
}

interface DraftItem {
  title: string;
  level: PlanningLevel;
}

export function BreakDownDialog({ taskId, defaultLevel, onClose }: BreakDownDialogProps) {
  const breakDown = useBreakDownTask();
  const today = localDateKey();
  const [items, setItems] = useState<DraftItem[]>([{ title: "", level: defaultLevel }]);

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit() {
    if (!taskId) return;
    const prepared = items
      .map((item) => ({
        title: item.title.trim(),
        level: item.level,
        periodKey: currentPeriodKey(item.level, today),
      }))
      .filter((item) => item.title.length > 0);

    if (prepared.length === 0) return;

    await breakDown.mutateAsync({ id: taskId, items: prepared });
    setItems([{ title: "", level: defaultLevel }]);
    onClose();
  }

  return (
    <Dialog open={taskId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Break this down</DialogTitle>
        </DialogHeader>
        <p className="-mt-2 text-sm text-muted-foreground">
          Create smaller, linked tasks for this objective. The original stays put as the overall goal.
        </p>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                autoFocus={index === items.length - 1}
                placeholder="Smaller task..."
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && index === items.length - 1 && item.title.trim()) {
                    e.preventDefault();
                    setItems((prev) => [...prev, { title: "", level: defaultLevel }]);
                  }
                }}
                className="flex-1"
              />
              <Select value={item.level} onValueChange={(level) => updateItem(index, { level: level as PlanningLevel })}>
                <SelectTrigger className="w-28 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANNING_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {levelLabel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {items.length > 1 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <div className="w-9" />
              )}
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-muted-foreground"
          onClick={() => setItems((prev) => [...prev, { title: "", level: defaultLevel }])}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add another
        </Button>
        <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={breakDown.isPending}>
            {breakDown.isPending ? "Creating..." : "Create tasks"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
