import { db } from "@/lib/db";

export async function findSubtasksByTaskId(taskId: string) {
  return db.task.findMany({
    where: { parentId: taskId, deletedAt: null },
    orderBy: { order: "asc" },
  });
}

export async function findSubtaskById(subtaskId: string) {
  return db.task.findFirst({ where: { id: subtaskId, deletedAt: null } });
}

export async function createSubtask(
  userId: string,
  taskId: string,
  data: { title: string; description?: string | null; order: number },
) {
  return db.task.create({
    data: {
      userId,
      parentId: taskId,
      title: data.title,
      description: data.description ?? null,
      order: data.order,
      level: "DAY", // Default level for subtasks
    },
  });
}

export async function updateSubtask(
  subtaskId: string,
  data: { title?: string; description?: string | null; completed?: boolean; order?: number },
) {
  return db.task.update({ where: { id: subtaskId }, data });
}

export async function deleteSubtask(subtaskId: string) {
  return db.task.update({ where: { id: subtaskId }, data: { deletedAt: new Date() } });
}

export async function countSubtaskProgress(taskId: string) {
  const [total, completed] = await Promise.all([
    db.task.count({ where: { parentId: taskId, deletedAt: null } }),
    db.task.count({ where: { parentId: taskId, completed: true, deletedAt: null } }),
  ]);

  return { total, completed };
}

export async function getNextSubtaskOrder(taskId: string) {
  const last = await db.task.findFirst({
    where: { parentId: taskId, deletedAt: null },
    orderBy: { order: "desc" },
  });
  return (last?.order ?? -1) + 1;
}