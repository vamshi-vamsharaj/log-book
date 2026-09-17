import { db } from "@/lib/db";

export async function findReminderByTaskId(taskId: string) {
  return db.taskReminder.findUnique({ where: { taskId } });
}

export async function upsertReminder(
  taskId: string,
  data: {
    enabled: boolean;
    offsetMinutes: number | null;
    customRemindAt: Date | null;
    remindAt: Date | null;
  },
) {
  return db.taskReminder.upsert({
    where: { taskId },
    update: data,
    create: { taskId, ...data },
  });
}

export async function deleteReminder(taskId: string) {
  return db.taskReminder.deleteMany({ where: { taskId } });
}