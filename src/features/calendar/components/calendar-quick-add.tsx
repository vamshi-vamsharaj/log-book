"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCalendarCreateTask } from "@/features/calendar/hooks/use-calendar-tasks";
import { parseDateParts, MONTH_NAMES, FULL_WEEKDAY_LABELS } from "@/features/calendar/utils";
import { weekdayIndex } from "@/lib/period";

interface CalendarQuickAddProps {
  dateKey: string | null;
  onClose: () => void;
}

export function CalendarQuickAdd({ dateKey, onClose }: CalendarQuickAddProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const createTask = useCalendarCreateTask();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !dateKey) return;
    try {
      await createTask.mutateAsync({
        title: trimmed,
        scheduledDate: dateKey,
        scheduledTime: time || undefined,
      });
      setTitle("");
      setTime("");
      onClose();
    } catch {
      // error surfaced via mutation state
    }
  }

  const { day, month, year } = dateKey ? parseDateParts(dateKey) : { day: 0, month: 0, year: 0 };
  const dow = dateKey ? weekdayIndex(dateKey) : 0;

  return (
    <Dialog open={Boolean(dateKey)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm gap-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            New task
          </p>
          {dateKey ? (
            <p className="mt-1 text-lg font-semibold">
              {FULL_WEEKDAY_LABELS[dow]}, {MONTH_NAMES[month - 1]} {day}, {year}
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Task title..."
            className="text-sm"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-10 shrink-0">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {createTask.isError ? (
            <p className="text-xs text-destructive">{createTask.error.message}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || createTask.isPending}
            >
              {createTask.isPending ? "Adding..." : "Add task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
