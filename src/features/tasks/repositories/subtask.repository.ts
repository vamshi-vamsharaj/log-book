import { db } from "@/lib/db";

export async function findSubtasksByTaskId(taskId: string) {
  return db.subtask.findMany({
    where: { taskId },
    orderBy: { order: "asc" },
  });
}

export async function findSubtaskById(subtaskId: string) {
  return db.subtask.findFirst({ where: { id: subtaskId } });
}

export async function createSubtask(
  _userId: string,
  taskId: string,
  data: { title: string; description?: string | null; order: number },
) {
  return db.subtask.create({
    data: {
      taskId,
      title: data.title,
      order: data.order,
    },
  });
}

export async function updateSubtask(
  subtaskId: string,
  data: { title?: string; description?: string | null; completed?: boolean; order?: number },
) {
  const updateData: { title?: string; completed?: boolean; order?: number } = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.order !== undefined) updateData.order = data.order;

  return db.subtask.update({ where: { id: subtaskId }, data: updateData });
}

export async function deleteSubtask(subtaskId: string) {
  return db.subtask.delete({ where: { id: subtaskId } });
}

export async function countSubtaskProgress(taskId: string) {
  const [total, completed] = await Promise.all([
    db.subtask.count({ where: { taskId } }),
    db.subtask.count({ where: { taskId, completed: true } }),
  ]);

  return { total, completed };
}

export async function getNextSubtaskOrder(taskId: string) {
  const last = await db.subtask.findFirst({
    where: { taskId },
    orderBy: { order: "desc" },
  });
  return (last?.order ?? -1) + 1;
}