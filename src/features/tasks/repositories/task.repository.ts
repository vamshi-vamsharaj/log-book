import "server-only";

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import { db } from "@/lib/db";
import type { RichTextDoc } from "@/lib/description";
import type { PlanningLevel } from "@/lib/period";

type Tx = PrismaClient | Prisma.TransactionClient;

/** Converts a sanitized rich-text doc into the shape Prisma's generated
 * types require for a `Json?` column: `undefined` leaves the field
 * untouched, `null` writes an explicit SQL NULL, and a doc is narrowed to
 * `InputJsonValue` (safe because `sanitizeDescription` already guarantees
 * the shape is plain, serializable JSON). */
export function toDescriptionJson(
  doc: RichTextDoc | null | undefined,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  if (doc === undefined) return undefined;
  if (doc === null) return Prisma.JsonNull;
  return doc as unknown as Prisma.InputJsonValue;
}

export const TASK_SELECT = {
  id: true,
  userId: true,
  level: true,
  periodKey: true,
  order: true,
  title: true,
  description: true,
  completed: true,
  completedAt: true,
  estimatedMinutes: true,
  scheduledDate: true,
  scheduledTime: true,
  remindAt: true,
  sourceTaskId: true,
  sourceLinkType: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  subtasks: {
    orderBy: { order: "asc" as const },
    select: { id: true, title: true, completed: true, order: true },
  },
} satisfies Prisma.TaskSelect;

export type TaskRow = Prisma.TaskGetPayload<{ select: typeof TASK_SELECT }>;

export function findOwnedTask(userId: string, taskId: string, tx: Tx = db) {
  return tx.task.findFirst({
    where: { id: taskId, userId },
    select: TASK_SELECT,
  });
}

/** Alias used by service-layer helpers that check task ownership. */
export const findTaskById = findOwnedTask;

export function listPeriodTasks(
  userId: string,
  level: PlanningLevel,
  periodKey: string,
  includeCompleted: boolean,
  tx: Tx = db,
) {
  return tx.task.findMany({
    where: {
      userId,
      level,
      periodKey,
      deletedAt: null,
      ...(includeCompleted ? {} : { completed: false }),
    },
    select: TASK_SELECT,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export function listUnfinishedInPeriod(
  userId: string,
  level: PlanningLevel,
  periodKeys: string[],
  tx: Tx = db,
) {
  return tx.task.findMany({
    where: {
      userId,
      level,
      periodKey: { in: periodKeys },
      deletedAt: null,
      completed: false,
    },
    select: TASK_SELECT,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export function listDerivedFrom(sourceTaskId: string, userId: string, tx: Tx = db) {
  return tx.task.findMany({
    where: { sourceTaskId, userId, deletedAt: null },
    select: { id: true, level: true, periodKey: true, sourceLinkType: true },
  });
}

export async function nextOrder(
  userId: string,
  level: PlanningLevel,
  periodKey: string,
  tx: Tx = db,
): Promise<number> {
  const last = await tx.task.findFirst({
    where: { userId, level, periodKey, deletedAt: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (last?.order ?? -1) + 1;
}

export function createTask(
  data: Prisma.TaskUncheckedCreateInput,
  tx: Tx = db,
) {
  return tx.task.create({ data, select: TASK_SELECT });
}

export function updateTask(
  taskId: string,
  data: Prisma.TaskUpdateInput,
  tx: Tx = db,
) {
  return tx.task.update({ where: { id: taskId }, data, select: TASK_SELECT });
}

export function softDeleteTask(taskId: string, tx: Tx = db) {
  return tx.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
    select: { id: true, deletedAt: true },
  });
}

export function restoreTask(taskId: string, tx: Tx = db) {
  return tx.task.update({
    where: { id: taskId },
    data: { deletedAt: null },
    select: TASK_SELECT,
  });
}

export function runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return db.$transaction(fn);
}

export function createSubtask(taskId: string, title: string, order: number, tx: Tx = db) {
  return tx.subtask.create({ data: { taskId, title, order } });
}

export function findOwnedSubtask(userId: string, subtaskId: string, tx: Tx = db) {
  return tx.subtask.findFirst({
    where: { id: subtaskId, task: { userId } },
    select: { id: true, taskId: true, title: true, completed: true, order: true },
  });
}

export function updateSubtask(subtaskId: string, data: Prisma.SubtaskUpdateInput, tx: Tx = db) {
  return tx.subtask.update({ where: { id: subtaskId }, data });
}

export function deleteSubtask(subtaskId: string, tx: Tx = db) {
  return tx.subtask.delete({ where: { id: subtaskId } });
}

export function nextSubtaskOrder(taskId: string, tx: Tx = db) {
  return tx.subtask
    .findFirst({ where: { taskId }, orderBy: { order: "desc" }, select: { order: true } })
    .then((last: { order: number } | null) => (last?.order ?? -1) + 1);
}
