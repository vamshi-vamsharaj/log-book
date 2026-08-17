import { z } from "zod";

export const planningLevelEnum = z.enum(["YEAR", "SIX_MONTH", "QUARTER", "MONTH", "WEEK", "DAY"]);

const scheduledTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format");

export const createTaskSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(5000).optional().nullable(),
    level: planningLevelEnum.default("DAY"),
    periodKey: z.string().max(20).optional().nullable(),
    scheduledDate: z.coerce.date().optional().nullable(),
    scheduledTime: scheduledTimeSchema.optional().nullable(),
    estimatedMinutes: z.coerce.number().int().min(1).max(1440).optional().nullable(),
    remindAt: z.coerce.date().optional().nullable(),
    parentId: z.string().cuid().optional().nullable(),
  })
  .refine((value) => value.level === "DAY" || Boolean(value.periodKey), {
    message: "A period is required for this planning level",
    path: ["periodKey"],
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    level: planningLevelEnum.optional(),
    periodKey: z.string().max(20).optional().nullable(),
    scheduledDate: z.coerce.date().optional().nullable(),
    scheduledTime: scheduledTimeSchema.optional().nullable(),
    estimatedMinutes: z.coerce.number().int().min(1).max(1440).optional().nullable(),
    remindAt: z.coerce.date().optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, "No fields provided to update");

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const listTasksQuerySchema = z.object({
  level: planningLevelEnum.optional(),
  periodKey: z.string().max(20).optional(),
  scheduledOnly: z.coerce.boolean().optional(),
  unscheduledOnly: z.coerce.boolean().optional(),
});

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const deriveTaskSchema = z.object({
  level: planningLevelEnum.default("DAY"),
  scheduledDate: z.coerce.date().optional().nullable(),
  title: z.string().min(1).max(200).optional(),
});

export type DeriveTaskInput = z.infer<typeof deriveTaskSchema>;

export const suggestionsQuerySchema = z.object({
  date: z.coerce.date(),
});