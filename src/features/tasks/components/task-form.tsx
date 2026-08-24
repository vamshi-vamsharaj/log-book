"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useCreateTag } from "@/features/tasks/mutations/use-taxonomy-mutations";
import { useCreateTask, useUpdateTask } from "@/features/tasks/mutations/use-task-mutations";
import { useCategories, useLabels, useTags } from "@/features/tasks/queries/use-taxonomy";
import { createTaskSchema } from "@/features/tasks/schemas/task.schema";
import type { TaskDTO } from "@/features/tasks/types";

interface TaskFormValues {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  categoryId: string;
  labelIds: string[];
  tagIds: string[];
  dueDate: string;
  targetTime: string;
  estimatedMinutes: string;
  notifyEnabled: boolean;
  reminderOffsetMinutes: string;
}

interface TaskFormProps {
  task?: TaskDTO;
  onSuccess?: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const isEdit = Boolean(task);
  const { data: categories } = useCategories();
  const { data: labels } = useLabels();
  const { data: tags } = useTags();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id ?? "");
  const createTag = useCreateTag();


  const [newTagName, setNewTagName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState } = useForm<TaskFormValues>({
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "MEDIUM",
      categoryId: task?.category?.id ?? "",
      labelIds: task?.labels.map((label) => label.id) ?? [],
      tagIds: task?.tags.map((tag) => tag.id) ?? [],
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
      targetTime: task?.targetTime ?? "",
      estimatedMinutes: task?.estimatedMinutes ? String(task.estimatedMinutes) : "",
      notifyEnabled: task?.reminder?.enabled ?? false,
      reminderOffsetMinutes: task?.reminder?.offsetMinutes
        ? String(task.reminder.offsetMinutes)
        : "10",
    },
  });

  const selectedLabelIds = watch("labelIds");
  const selectedTagIds = watch("tagIds");

  function toggleLabel(id: string) {
    const current = selectedLabelIds ?? [];
    setValue(
      "labelIds",
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function toggleTag(id: string) {
    const current = selectedTagIds ?? [];
    setValue(
      "tagIds",
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) {
      return;
    }

    const tag = await createTag.mutateAsync({ name: newTagName.trim() });
    toggleTag((tag as { id: string }).id);
    setNewTagName("");
  }

  async function onSubmit(values: TaskFormValues) {
    setFormError(null);

    const payload = {
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      categoryId: values.categoryId || null,
      labelIds: values.labelIds ?? [],
      tagIds: values.tagIds ?? [],
      dueDate: values.dueDate ? new Date(values.dueDate) : null,
      targetTime: values.targetTime || null,
      estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : null,
    };

    const parsed = createTaskSchema.safeParse(payload);

    if (!parsed.success) {
      setFormError(parsed.error.errors[0]?.message ?? "Please check the form fields");
      return;
    }

    try {
      const savedTask = isEdit
        ? await updateTask.mutateAsync(parsed.data)
        : await createTask.mutateAsync(parsed.data);

      const targetTaskId = savedTask.id;

      if (values.notifyEnabled) {
        await fetch(`/api/tasks/${targetTaskId}/reminder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled: true,
            offsetMinutes: Number(values.reminderOffsetMinutes),
          }),
        });
      } else if (isEdit && task?.reminder?.enabled) {
        await fetch(`/api/tasks/${targetTaskId}/reminder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: false }),
        });
      }

      onSuccess?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  const isSubmitting = createTask.isPending || updateTask.isPending || formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title", { required: true })} autoFocus />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={watch("priority")}
            onValueChange={(value) => setValue("priority", value as TaskFormValues["priority"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={watch("categoryId") || "NONE"}
            onValueChange={(value) => setValue("categoryId", value === "NONE" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">No category</SelectItem>
              {(categories ?? []).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetTime">Target time</Label>
          <Input id="targetTime" type="time" {...register("targetTime")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedMinutes">Estimated (min)</Label>
          <Input id="estimatedMinutes" type="number" min={1} max={1440} {...register("estimatedMinutes")} />
        </div>
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced((value) => !value)}>
        {showAdvanced ? "Hide" : "Show"} labels, tags & notifications
      </Button>

      {showAdvanced ? (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-3">
              {(labels ?? []).map((label) => (
                <label key={label.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={(selectedLabelIds ?? []).includes(label.id)}
                    onCheckedChange={() => toggleLabel(label.id)}
                  />
                  {label.name}
                </label>
              ))}
              {(labels ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels yet.</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-3">
              {(tags ?? []).map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={(selectedTagIds ?? []).includes(tag.id)}
                    onCheckedChange={() => toggleTag(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New tag"
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleCreateTag}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={watch("notifyEnabled")}
                onCheckedChange={(checked) => setValue("notifyEnabled", checked === true)}
              />
              Notify me
            </label>
            {watch("notifyEnabled") ? (
              <Select
                value={watch("reminderOffsetMinutes")}
                onValueChange={(value) => setValue("reminderOffsetMinutes", value)}
              >
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">At target time</SelectItem>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="10">10 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </div>
      ) : null}

      {formError ? <p className="text-sm font-medium text-destructive">{formError}</p> : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create task"}
      </Button>
    </form>
  );
}