"use client";

import { Button } from "@/components/ui/button";
import { useDeriveTask } from "@/features/tasks/mutations/use-task-mutations";
import { useWeekSuggestions } from "@/features/tasks/queries/use-suggestions";

interface DaySuggestionsProps {
  date: Date;
}

export function DaySuggestions({ date }: DaySuggestionsProps) {
  const { data: suggestions } = useWeekSuggestions(date);
  const deriveTask = useDeriveTask();

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        From this week
      </p>
      <div className="space-y-1.5">
        {suggestions.map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-muted-foreground">{task.title}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                deriveTask.mutate({
                  parentId: task.id,
                  input: { level: "DAY", scheduledDate: date, title: task.title },
                })
              }
              disabled={deriveTask.isPending}
            >
              Add to today
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}