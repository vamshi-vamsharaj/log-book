import type { Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { getDayKey, getPeriodKey, getWeekKey } from "@/lib/period";
import * as taskRepository from "@/features/tasks/repositories/task.repository";
import type {
  CreateTaskInput,
  DeriveTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "@/features/tasks/schemas/task.schema";
import type { TaskDTO } from "@/features/tasks/types";

function toDTO(task: {
  id: string;
  userId: string;
  parentId: string | null;
  level: string;
  periodKey: string | null;
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  remindAt: Date | null;
  completed: boolean;
  completedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): TaskDTO {
  return {
    id: task.id,
    userId: task.userId,
    parentId: task.parentId,
    level: task.level as TaskDTO["level"],
    periodKey: task.periodKey,
    title: task.title,
    description: task.description,
    estimatedMinutes: task.estimatedMinutes,
    scheduledDate: task.scheduledDate ? task.scheduledDate.toISOString() : null,
    scheduledTime: task.scheduledTime,
    remindAt: task.remindAt ? task.remindAt.toISOString() : null,
    completed: task.completed,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    deletedAt: task.deletedAt ? task.deletedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

async function getOwnedTask(userId: string, id: string) {
  const task = await taskRepository.findTaskById(userId, id);

  if (!task) {
    throw AppError.notFound("Task not found");
  }

  return task;
}

export async function listTasks(userId: string, query: ListTasksQuery): Promise<TaskDTO[]> {
  const where: Prisma.TaskWhereInput = { deletedAt: null };

  if (query.level) {
    where.level = query.level;
  }

  if (query.periodKey) {
    where.periodKey = query.periodKey;
  }

  if (query.scheduledOnly) {
    where.scheduledDate = { not: null };
  }

  if (query.unscheduledOnly) {
    where.scheduledDate = null;
  }

  const tasks = await taskRepository.findManyTasks(userId, where);
  return tasks.map(toDTO);
}

export async function getTask(userId: string, id: string): Promise<TaskDTO> {
  const task = await getOwnedTask(userId, id);
  return toDTO(task);
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<TaskDTO> {
  let periodKey = input.periodKey ?? null;

  if (input.level === "DAY" && input.scheduledDate) {
    periodKey = getDayKey(input.scheduledDate);
  }

  const task = await taskRepository.createTask(userId, {
    title: input.title,
    description: input.description ?? null,
    level: input.level,
    periodKey,
    scheduledDate: input.scheduledDate ?? null,
    scheduledTime: input.scheduledTime ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    remindAt: input.remindAt ?? null,
    parentId: input.parentId ?? null,
  });

  return toDTO(task);
}

export async function updateTask(
  userId: string,
  id: string,
  input: UpdateTaskInput,
): Promise<TaskDTO> {
  const existing = await getOwnedTask(userId, id);

  const data: Prisma.TaskUpdateInput = { ...input };

  const nextLevel = input.level ?? existing.level;
  const nextScheduledDate =
    input.scheduledDate !== undefined ? input.scheduledDate : existing.scheduledDate;

  if (nextLevel === "DAY") {
    data.periodKey = nextScheduledDate ? getDayKey(nextScheduledDate) : null;
  } else if (input.level && input.level !== existing.level && !input.periodKey) {
    data.periodKey = getPeriodKey(input.level, new Date());
  }

  const updated = await taskRepository.updateTask(id, data);
  return toDTO(updated);
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  await getOwnedTask(userId, id);
  await taskRepository.softDeleteTask(id);
}

export async function restoreTask(userId: string, id: string): Promise<TaskDTO> {
  const task = await taskRepository.findTaskById(userId, id);

  if (!task) {
    throw AppError.notFound("Task not found");
  }

  const restored = await taskRepository.restoreTask(id);
  return toDTO(restored);
}

export async function completeTask(userId: string, id: string): Promise<TaskDTO> {
  await getOwnedTask(userId, id);
  const updated = await taskRepository.setCompleted(id, true);
  return toDTO(updated);
}

export async function reopenTask(userId: string, id: string): Promise<TaskDTO> {
  await getOwnedTask(userId, id);
  const updated = await taskRepository.setCompleted(id, false);
  return toDTO(updated);
}

export async function deriveTask(
  userId: string,
  parentId: string,
  input: DeriveTaskInput,
): Promise<TaskDTO> {
  const parent = await getOwnedTask(userId, parentId);

  const periodKey =
    input.level === "DAY" && input.scheduledDate
      ? getDayKey(input.scheduledDate)
      : getPeriodKey(input.level, input.scheduledDate ?? new Date());

  const child = await taskRepository.createTask(userId, {
    title: input.title ?? parent.title,
    level: input.level,
    periodKey,
    scheduledDate: input.scheduledDate ?? null,
    parentId: parent.id,
  });

  return toDTO(child);
}

export async function getWeekSuggestions(userId: string, date: Date): Promise<TaskDTO[]> {
  const weekKey = getWeekKey(date);
  const dayKey = getDayKey(date);
  const tasks = await taskRepository.findWeekSuggestions(userId, weekKey, dayKey);
  return tasks.map(toDTO);
}