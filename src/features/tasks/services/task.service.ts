
import { AppError } from "@/lib/errors";
import { currentPeriodKey, getPeriodRange, higherLevels, isValidPeriodKey, localDateKey, overlappingPeriodKeys, periodKeyFor } from "@/lib/period";
import { sanitizeDescription } from "@/lib/description";
import * as repo from "@/features/tasks/repositories/task.repository";
import type {
  BreakDownTaskInput,
  CreateTaskInput,
  ImportTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
} from "@/features/tasks/validations/task.validation";
import type { DeriveTaskInput } from "@/features/tasks/schemas/task.schema";
import type { PlanningLevel } from "@/lib/period";

/** Bring an existing task into `level`/`periodKey` as a linked (not duplicated)
 * task: creates a NEW row for the target period that points back at the
 * original via `sourceTaskId`/`sourceLinkType: "IMPORTED"`. Refuses to
 * create a second import of the same source into the same period. */
export async function importTask(userId: string, input: ImportTaskInput) {
  const source = await repo.findOwnedTask(userId, input.sourceTaskId);
  if (!source || source.deletedAt) {
    throw AppError.notFound("Task to import was not found");
  }

  const existingImports = await repo.listDerivedFrom(source.id, userId);
  const duplicate = existingImports.find(
    (task) =>
      task.level === input.level && task.periodKey === input.periodKey && task.sourceLinkType === "IMPORTED",
  );
  if (duplicate) {
    throw AppError.conflict("This item has already been imported into that period");
  }

  const order = await repo.nextOrder(userId, input.level, input.periodKey);

  return repo.createTask({
    userId,
    level: input.level,
    periodKey: input.periodKey,
    title: input.title ?? source.title,
    order,
    sourceTaskId: source.id,
    sourceLinkType: "IMPORTED",
  });
}

/** Move an existing task to a different level/period IN PLACE — same row,
 * same id, same history; no duplication, no source link (this is not an
 * import, it's a relocation of the one task). */
export async function moveTask(userId: string, taskId: string, input: MoveTaskInput) {
  const existing = await repo.findOwnedTask(userId, taskId);
  if (!existing || existing.deletedAt) {
    throw AppError.notFound("Task not found");
  }

  const order = await repo.nextOrder(userId, input.level, input.periodKey);

  return repo.updateTask(taskId, {
    level: input.level,
    periodKey: input.periodKey,
    order,
    ...(input.level !== "DAY" ? { scheduledDate: null, scheduledTime: null } : {}),
  });
}

/** Break a higher-level objective into several smaller linked tasks at
 * (usually lower) levels, each pointing back at the source via
 * `sourceLinkType: "BROKEN_DOWN"`. The source task itself is left untouched
 * so it still represents the overall objective. */
export async function breakDownTask(userId: string, taskId: string, input: BreakDownTaskInput) {
  const source = await repo.findOwnedTask(userId, taskId);
  if (!source || source.deletedAt) {
    throw AppError.notFound("Task not found");
  }

  return repo.runInTransaction(async (tx) => {
    const created = [];
    const orderCursor = new Map<string, number>();

    for (const item of input.items) {
      const cacheKey = `${item.level}:${item.periodKey}`;
      const order = orderCursor.has(cacheKey)
        ? orderCursor.get(cacheKey)!
        : await repo.nextOrder(userId, item.level, item.periodKey, tx);
      orderCursor.set(cacheKey, order + 1);

      const task = await repo.createTask(
        {
          userId,
          level: item.level,
          periodKey: item.periodKey,
          title: item.title,
          scheduledDate: item.scheduledDate ?? null,
          order,
          sourceTaskId: source.id,
          sourceLinkType: "BROKEN_DOWN",
        },
        tx,
      );
      created.push(task);
    }

    return created;
  });
}

/** Surfaces unfinished tasks from every HIGHER planning level whose period
 * overlaps `level`/`periodKey` — e.g. opening the Day planner surfaces
 * unfinished Week/Month/Quarter/Six-Month/Year items covering that day.
 * Purely advisory: nothing here writes anything or auto-populates the
 * planner; the caller decides whether to Import or Break Down. */
export async function getRecommendations(userId: string, level: PlanningLevel, periodKey: string) {
  const levelsAbove = higherLevels(level);
  if (levelsAbove.length === 0) return [];

  const ownRange = getPeriodRange(level, periodKey);
  if (!ownRange) return [];

  const results: Array<{ level: PlanningLevel; tasks: repo.TaskRow[] }> = [];

  for (const higherLevel of levelsAbove) {
    const keys = overlappingPeriodKeys(higherLevel, ownRange.start, ownRange.end);
    if (keys.length === 0) continue;
    const tasks = await repo.listUnfinishedInPeriod(userId, higherLevel, keys);
    if (tasks.length > 0) {
      results.push({ level: higherLevel, tasks });
    }
  }

  return results;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const order = await repo.nextOrder(userId, input.level, input.periodKey);

  return repo.createTask({
    userId,
    level: input.level,
    periodKey: input.periodKey,
    title: input.title,
    order,
    scheduledDate: input.scheduledDate ?? null,
    scheduledTime: input.scheduledTime ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    description: repo.toDescriptionJson(sanitizeDescription(input.description)),
  });
}

export async function listPeriodTasks(
  userId: string,
  level: PlanningLevel,
  periodKey: string,
  includeCompleted: boolean,
) {
  if (!isValidPeriodKey(level, periodKey)) {
    throw new AppError("Invalid period", 400, "VALIDATION_ERROR");
  }
  return repo.listPeriodTasks(userId, level, periodKey, includeCompleted);
}

async function assertOwnedActive(userId: string, taskId: string) {
  const task = await repo.findOwnedTask(userId, taskId);
  if (!task || task.deletedAt) {
    throw AppError.notFound("Task not found");
  }
  return task;
}

export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
  await assertOwnedActive(userId, taskId);

  const data: Record<string, unknown> = { ...input };

  if (input.completed !== undefined) {
    data.completedAt = input.completed ? new Date() : null;
  }
  if (input.description !== undefined) {
    data.description = repo.toDescriptionJson(sanitizeDescription(input.description));
  }
  if (input.remindAt !== undefined) {
    data.remindAt = input.remindAt ? new Date(input.remindAt) : null;
  }

  return repo.updateTask(taskId, data);
}

export async function deleteTask(userId: string, taskId: string) {
  await assertOwnedActive(userId, taskId);
  return repo.softDeleteTask(taskId);
}

export async function restoreTask(userId: string, taskId: string) {
  const task = await repo.findOwnedTask(userId, taskId);
  if (!task) {
    throw AppError.notFound("Task not found");
  }
  return repo.restoreTask(taskId);
}

export async function createSubtask(userId: string, taskId: string, title: string) {
  await assertOwnedActive(userId, taskId);
  const order = await repo.nextSubtaskOrder(taskId);
  return repo.createSubtask(taskId, title, order);
}

export async function updateSubtask(
  userId: string,
  subtaskId: string,
  data: { title?: string; completed?: boolean; order?: number },
) {
  const subtask = await repo.findOwnedSubtask(userId, subtaskId);
  if (!subtask) {
    throw AppError.notFound("Subtask not found");
  }
  return repo.updateSubtask(subtaskId, data);
}

export async function deleteSubtask(userId: string, subtaskId: string) {
  const subtask = await repo.findOwnedSubtask(userId, subtaskId);
  if (!subtask) {
    throw AppError.notFound("Subtask not found");
  }
  return repo.deleteSubtask(subtaskId);
}

export function todayPeriodKey(level: PlanningLevel): string {
  return currentPeriodKey(level, localDateKey());
}

export async function completeTask(userId: string, taskId: string) {
  const task = await assertOwnedActive(userId, taskId);
  return repo.updateTask(task.id, { completed: true, completedAt: new Date() });
}

export async function reopenTask(userId: string, taskId: string) {
  const task = await assertOwnedActive(userId, taskId);
  return repo.updateTask(task.id, { completed: false, completedAt: null });
}

export async function cancelTask(userId: string, taskId: string) {
  const task = await assertOwnedActive(userId, taskId);
  return repo.updateTask(task.id, { completed: false, deletedAt: new Date() });
}

export async function archiveTask(userId: string, taskId: string) {
  const task = await assertOwnedActive(userId, taskId);
  return repo.softDeleteTask(task.id);
}

/** Mark a task as intentionally skipped for its scheduled occurrence.
 * Unlike completing, this does NOT mark it done and does NOT affect
 * completion statistics. */
export async function skipTask(userId: string, taskId: string) {
  const task = await assertOwnedActive(userId, taskId);
  return repo.updateTask(task.id, { skippedAt: new Date() });
}

/** Remove a previous skip, making the task outstanding again. */
export async function unskipTask(userId: string, taskId: string) {
  const task = await assertOwnedActive(userId, taskId);
  return repo.updateTask(task.id, { skippedAt: null });
}

export async function deriveTask(userId: string, taskId: string, input: DeriveTaskInput) {
  const source = await assertOwnedActive(userId, taskId);
  const today = localDateKey();
  const level = input.level ?? "DAY";
  const periodKey = periodKeyFor(level, today);
  const order = await repo.nextOrder(userId, level, periodKey);

  return repo.createTask({
    userId,
    level,
    periodKey,
    title: input.title ?? source.title,
    order,
    scheduledDate: input.scheduledDate ? input.scheduledDate.toISOString().slice(0, 10) : null,
    sourceTaskId: source.id,
    sourceLinkType: "BROKEN_DOWN",
  });
}

export async function getWeekSuggestions(userId: string, date: Date) {
  const dateKey = localDateKey(date);
  const weekKey = periodKeyFor("WEEK", dateKey);
  const range = getPeriodRange("WEEK", weekKey);

  if (!range) return [];

  const levelsAbove = higherLevels("DAY");
  const results: Array<{ level: PlanningLevel; tasks: repo.TaskRow[] }> = [];

  for (const level of levelsAbove) {
    const keys = overlappingPeriodKeys(level, range.start, range.end);
    if (keys.length === 0) continue;
    const tasks = await repo.listUnfinishedInPeriod(userId, level, keys);
    if (tasks.length > 0) {
      results.push({ level, tasks });
    }
  }

  return results;
}
