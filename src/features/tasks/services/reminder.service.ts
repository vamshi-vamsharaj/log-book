import { AppError } from "@/lib/errors";
import * as reminderRepository from "@/features/tasks/repositories/reminder.repository";
import * as taskRepository from "@/features/tasks/repositories/task.repository";
import type { UpdateReminderInput } from "@/features/tasks/schemas/reminder.schema";
import { combineDueDateAndTargetTime } from "@/features/tasks/utils/time";

async function assertTaskOwnership(userId: string, taskId: string) {
  const task = await taskRepository.findTaskById(userId, taskId);

  if (!task) {
    throw AppError.notFound("Task not found");
  }

  return task;
}

export async function getReminder(userId: string, taskId: string) {
  await assertTaskOwnership(userId, taskId);
  return reminderRepository.findReminderByTaskId(taskId);
}

export async function setReminder(userId: string, taskId: string, input: UpdateReminderInput) {
  const task = await assertTaskOwnership(userId, taskId);

  let remindAt: Date | null = null;

  if (input.enabled) {
    if (input.customRemindAt) {
      remindAt = input.customRemindAt;
    } else if (input.offsetMinutes !== undefined && input.offsetMinutes !== null) {
      const target = combineDueDateAndTargetTime(task.dueDate, task.targetTime);

      if (!target) {
        throw AppError.invalidStateTransition(
          "Set a due date and target time before enabling a relative reminder",
        );
      }

      remindAt = new Date(target.getTime() - input.offsetMinutes * 60 * 1000);
    }
  }

  return reminderRepository.upsertReminder(taskId, {
    enabled: input.enabled,
    offsetMinutes: input.offsetMinutes ?? null,
    customRemindAt: input.customRemindAt ?? null,
    remindAt,
  });
}

export async function clearReminder(userId: string, taskId: string) {
  await assertTaskOwnership(userId, taskId);
  await reminderRepository.deleteReminder(taskId);
}