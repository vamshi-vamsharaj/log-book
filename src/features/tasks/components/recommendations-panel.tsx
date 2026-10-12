"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useImportTask, useRecommendations } from "@/features/tasks/hooks/use-planner-tasks";
import { levelLabel, type PlanningLevel } from "@/lib/period";

interface RecommendationsPanelProps {
  level: PlanningLevel;
  periodKey: string;
}

/**
 * Surfaces unfinished work from higher planning levels that overlap the
 * period being viewed — purely advisory. Nothing here is auto-added; the
 * user explicitly imports an item, which creates a new linked task rather
 * than duplicating or silently relocating the source. A brief inline
 * confirmation replaces the row once imported, so the action always feels
 * acknowledged even though the row itself disappears on the next refetch.
 */
export function RecommendationsPanel({ level, periodKey }: RecommendationsPanelProps) {
  const { data: groups } = useRecommendations(level, periodKey);
  const importTask = useImportTask();
  const [justImported, setJustImported] = useState<string | null>(null);

  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-1 space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3.5 duration-200">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        From your longer-term plans
      </p>
      <div className="space-y-2.5">
        {groups.map((group) => (
          <div key={group.level} className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
              {levelLabel(group.level)}
            </p>
            {group.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-md px-1.5 py-1">
                <span className="truncate text-sm text-foreground/90">{task.title}</span>
                {justImported === task.id ? (
                  <span className="shrink-0 text-xs text-muted-foreground">Added ✓</span>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 shrink-0 gap-1 px-2 text-xs"
                    disabled={importTask.isPending}
                    onClick={async () => {
                      await importTask.mutateAsync({ sourceTaskId: task.id, level, periodKey });
                      setJustImported(task.id);
                    }}
                  >
                    Bring in
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
