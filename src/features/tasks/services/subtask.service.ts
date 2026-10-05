import { AppError } from "@/lib/errors";
import * as subtaskRepository from "@/features/tasks/repositories/subtask.repository";
import * as taskRepository from "@/features/tasks/repositories/task.repository";
import type { CreateSubtaskInput, UpdateSubtaskInput } from "@/features/tasks/schemas/subtask.schema";

async function assertTaskOwnership(userId: string, taskId: string) {
  const task = await taskRepository.findTaskById(userId, taskId);

  if (!task) {
    throw AppError.notFound("Task not found");
  }

  return task;
}

export async function listSubtasks(userId: string, taskId: string) {
  await assertTaskOwnership(userId, taskId);
  return subtaskRepository.findSubtasksByTaskId(taskId);
}

export async function createSubtask(userId: string, taskId: string, input: CreateSubtaskInput) {
  await assertTaskOwnership(userId, taskId);
  const order = await subtaskRepository.getNextSubtaskOrder(taskId);
  const subtask = await subtaskRepository.createSubtask(userId, taskId, {
    title: input.title,
    description: input.description ?? null,
    order,
  });

  return subtask;
}

async function assertSubtaskOwnership(userId: string, taskId: string, subtaskId: string) {
  await assertTaskOwnership(userId, taskId);
  const subtask = await subtaskRepository.findSubtaskById(subtaskId);

  if (!subtask || subtask.parentId !== taskId) {
    throw AppError.notFound("Subtask not found");
  }

  return subtask;
}

export async function updateSubtask(
  userId: string,
  taskId: string,
  subtaskId: string,
  input: UpdateSubtaskInput,
) {
  await assertSubtaskOwnership(userId, taskId, subtaskId);
  const updated = await subtaskRepository.updateSubtask(subtaskId, input);

  return updated;
}

export async function deleteSubtask(userId: string, taskId: string, subtaskId: string) {
  await assertSubtaskOwnership(userId, taskId, subtaskId);
  await subtaskRepository.deleteSubtask(subtaskId);
}