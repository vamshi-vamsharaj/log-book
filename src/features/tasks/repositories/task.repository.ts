import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export async function findManyTasks(userId: string, where: Prisma.TaskWhereInput) {
  return db.task.findMany({
    where: { ...where, userId },
    orderBy: [{ scheduledDate: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  });
}

export async function findTaskById(userId: string, id: string) {
  return db.task.findFirst({ where: { id, userId } });
}

export async function findTaskWithChildren(userId: string, id: string) {
  return db.task.findFirst({
    where: { id, userId },
    include: { children: { select: { id: true, scheduledDate: true, deletedAt: true } } },
  });
}

export async function createTask(userId: string, data: Omit<Prisma.TaskUncheckedCreateInput, "userId">) {
  return db.task.create({ data: { ...data, userId } });
}

export async function updateTask(id: string, data: Prisma.TaskUpdateInput) {
  return db.task.update({ where: { id }, data });
}

export async function softDeleteTask(id: string) {
  return db.task.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function restoreTask(id: string) {
  return db.task.update({ where: { id }, data: { deletedAt: null } });
}

export async function setCompleted(id: string, completed: boolean) {
  return db.task.update({
    where: { id },
    data: { completed, completedAt: completed ? new Date() : null },
  });
}

export async function findWeekSuggestions(userId: string, weekKey: string, dayKey: string) {
  return db.task.findMany({
    where: {
      userId,
      level: "WEEK",
      periodKey: weekKey,
      deletedAt: null,
      completed: false,
    },
    include: {
      children: {
        where: { deletedAt: null },
        select: { id: true, scheduledDate: true },
      },
    },
    orderBy: { createdAt: "asc" },
  }).then((tasks) =>
    tasks.filter(
      (task) =>
        !task.children.some(
          (child) => child.scheduledDate && child.scheduledDate.toISOString().slice(0, 10) === dayKey,
        ),
    ),
  );
}