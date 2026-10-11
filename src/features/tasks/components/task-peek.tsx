"use client";

import { Calendar, Check, Clock, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/features/tasks/components/rich-text-editor";
import type { RichTextDoc } from "@/lib/description";
import {
  useCreateSubtask,
  useDeleteSubtask,
  useDeleteTask,
  useUpdateSubtask,
  useUpdateTask,
  type TaskDTO,
} from "@/features/tasks/hooks/use-planner-tasks";
import type { PlanningLevel } from "@/lib/period";
import { cn } from "@/lib/utils";

interface TaskPeekProps {
  task: TaskDTO | null;
  level: PlanningLevel;
  periodKey: string;
  onClose: () => void;
}

function parseDurationInput(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const h = trimmed.match(/(\d+)\s*h/);
  const m = trimmed.match(/(\d+)\s*m/);
  if (!h && !m) return null;
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/**
 * The center-peek contextual editor — this is where someone actually spends
 * time thinking about a task, so it reads more like a quiet document than a
 * settings form: one generous title, an unobtrusive rich-text body, and
 * metadata grouped into a single calm row rather than a wall of labeled
 * fields.
 */
export function TaskPeek({ task, level, periodKey, onClose }: TaskPeekProps) {
  const updateTask = useUpdateTask(level, periodKey);
  const deleteTask = useDeleteTask(level, periodKey);
  const createSubtask = useCreateSubtask(level, periodKey);
  const updateSubtask = useUpdateSubtask(level, periodKey);
  const deleteSubtask = useDeleteSubtask(level, periodKey);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<RichTextDoc | null>(null);
  const [estimateInput, setEstimateInput] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description);
    setEstimateInput(task.estimatedMinutes ? formatMinutes(task.estimatedMinutes) : "");
    setScheduledDate(task.scheduledDate ?? "");
    setScheduledTime(task.scheduledTime ?? "");
    setConfirmingDelete(false);
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!task) return null;

  function commitField(input: Record<string, unknown>) {
    if (!task) return;
    updateTask.mutate({ id: task.id, ...input });
  }

  function commitTitle() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task?.title) {
      commitField({ title: trimmed });
    } else {
      setTitle(task?.title ?? "");
    }
  }

  function commitEstimate() {
    const minutes = parseDurationInput(estimateInput);
    commitField({ estimatedMinutes: minutes });
    setEstimateInput(minutes ? formatMinutes(minutes) : "");
  }

  function commitSchedule(date: string, time: string) {
    commitField({
      scheduledDate: date || null,
      scheduledTime: date ? time || null : null,
    });
  }

  async function handleAddSubtask() {
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    setNewSubtask("");
    await createSubtask.mutateAsync({ taskId: task!.id, title: trimmed });
  }

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <Dialog open={Boolean(task)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-xl gap-0 overflow-y-auto p-0">
        <div className="flex items-start gap-3 px-6 pb-4 pt-6">
          <button
            type="button"
            aria-label={task.completed ? "Mark as not done" : "Mark as done"}
            onClick={() => commitField({ completed: !task.completed })}
            className={cn(
              "mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ease-out hover:scale-110",
              task.completed
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/35 hover:border-primary/70",
            )}
          >
            <Check
              className={cn("h-3.5 w-3.5 transition-all", task.completed ? "scale-100 opacity-100" : "scale-50 opacity-0")}
              strokeWidth={3}
            />
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className={cn(
              "flex-1 border-none bg-transparent text-xl font-semibold leading-tight tracking-tight outline-none",
              task.completed && "text-muted-foreground/70 line-through",
            )}
          />
        </div>

        <div className="space-y-5 px-6 pb-6">
          <RichTextEditor
            value={description}
            onChange={(doc) => {
              setDescription(doc);
              commitField({ description: doc });
            }}
            placeholder="Add notes, instructions, or links..."
          />

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 p-3">
            <div className="flex min-w-[7rem] flex-1 items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="w-full">
                <p className="text-[11px] text-muted-foreground">Estimated</p>
                <Input
                  value={estimateInput}
                  onChange={(e) => setEstimateInput(e.target.value)}
                  onBlur={commitEstimate}
                  placeholder="1h 30m"
                  className="h-6 border-none p-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex min-w-[8rem] flex-1 items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="w-full">
                <p className="text-[11px] text-muted-foreground">Date &amp; time</p>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value);
                      commitSchedule(e.target.value, scheduledTime);
                    }}
                    className="h-6 flex-1 border-none bg-transparent p-0 text-sm text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                  {scheduledDate ? (
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => {
                        setScheduledTime(e.target.value);
                        commitSchedule(scheduledDate, e.target.value);
                      }}
                      className="h-6 w-20 border-none bg-transparent p-0 text-sm text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Subtasks</p>
              {task.subtasks.length > 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  {completedSubtasks}/{task.subtasks.length}
                </p>
              ) : null}
            </div>
            <div className="space-y-0.5">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="group/sub flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent/50">
                  <button
                    type="button"
                    aria-label={subtask.completed ? "Mark as not done" : "Mark as done"}
                    onClick={() => updateSubtask.mutate({ id: subtask.id, completed: !subtask.completed })}
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                      subtask.completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/35 hover:border-primary/70",
                    )}
                  >
                    {subtask.completed ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      subtask.completed && "text-muted-foreground/70 line-through",
                    )}
                  >
                    {subtask.title}
                  </span>
                  <button
                    type="button"
                    aria-label="Delete subtask"
                    onClick={() => deleteSubtask.mutate(subtask.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/sub:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-1.5 py-0.5">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a subtask..."
                className="flex-1 border-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
            Work sessions (start/pause/resume/stop) arrive in a later phase — this task is ready for
            them; nothing here is a non-functional stand-in.
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-6 py-3">
          <span className="text-xs text-muted-foreground">
            Created {new Date(task.createdAt).toLocaleDateString()}
          </span>
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Delete this task?</span>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteTask.mutate(task.id);
                  onClose();
                }}
              >
                Delete
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
