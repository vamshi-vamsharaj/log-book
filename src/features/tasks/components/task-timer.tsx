"use client";

import { Pause, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  usePauseTimer,
  useResumeTimer,
  useStartTimer,
  useStopTimer,
} from "@/features/tasks/mutations/use-timer-mutations";
import type { TaskDTO } from "@/features/tasks/types";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

interface TaskTimerProps {
  task: TaskDTO;
}

export function TaskTimer({ task }: TaskTimerProps) {
  const [liveSeconds, setLiveSeconds] = useState(task.actualSeconds);
  const start = useStartTimer();
  const pause = usePauseTimer();
  const resume = useResumeTimer();
  const stop = useStopTimer();

  const isRunning = Boolean(task.activeTimeEntry);
  const isTerminal = task.status === "COMPLETED" || task.status === "CANCELLED" || task.status === "ARCHIVED";

  useEffect(() => {
    setLiveSeconds(task.actualSeconds);

    if (!task.activeTimeEntry) {
      return;
    }

    const startedAt = new Date(task.activeTimeEntry.startedAt).getTime();

    const interval = setInterval(() => {
      const baseSeconds = task.actualSeconds - Math.floor((Date.now() - startedAt) / 1000);
      setLiveSeconds(baseSeconds + Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [task.actualSeconds, task.activeTimeEntry]);

  const estimatedSeconds = task.estimatedMinutes ? task.estimatedMinutes * 60 : null;
  const overEstimate = estimatedSeconds !== null && liveSeconds > estimatedSeconds;
  const mutationError = start.error ?? pause.error ?? resume.error ?? stop.error;

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-muted-foreground">Estimated</p>
          <p className="font-medium">
            {estimatedSeconds !== null ? formatDuration(estimatedSeconds) : "Not set"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Actual</p>
          <p className={cnOverEstimate(overEstimate)}>{formatDuration(liveSeconds)}</p>
        </div>
      </div>
      {overEstimate && estimatedSeconds !== null ? (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          Over estimate by {formatDuration(liveSeconds - estimatedSeconds)}
        </p>
      ) : null}
      {!isTerminal ? (
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              size="sm"
              onClick={() => (task.actualSeconds > 0 ? resume.mutate(task.id) : start.mutate(task.id))}
              disabled={start.isPending || resume.isPending}
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              {task.actualSeconds > 0 ? "Resume" : "Start"}
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => pause.mutate(task.id)} disabled={pause.isPending}>
                <Pause className="mr-1.5 h-3.5 w-3.5" />
                Pause
              </Button>
              <Button size="sm" variant="outline" onClick={() => stop.mutate(task.id)} disabled={stop.isPending}>
                <Square className="mr-1.5 h-3.5 w-3.5" />
                Stop
              </Button>
            </>
          )}
        </div>
      ) : null}
      {mutationError ? (
        <p className="text-xs font-medium text-destructive">{mutationError.message}</p>
      ) : null}
    </div>
  );
}

function cnOverEstimate(over: boolean): string {
  return over ? "font-medium text-amber-600 dark:text-amber-400" : "font-medium";
}