import { z } from "zod";

import { PLANNING_LEVELS, isValidDateKey, isValidPeriodKey } from "@/lib/period";

export const planningLevelSchema = z.enum(PLANNING_LEVELS);

export const dateKeySchema = z
  .string()
  .refine((value) => isValidDateKey(value), { message: "Invalid calendar date" });

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:mm (24h)");

/** A tiny allow-listed rich-text document (Tiptap/ProseMirror JSON). We never
 * trust arbitrary HTML from the client — only this structured shape, and it
 * is re-sanitized server-side in description.ts before every write. */
const richTextMarkSchema = z.object({
  type: z.enum(["bold", "italic", "strike", "code", "link"]),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

const richTextNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z.array(richTextMarkSchema).optional(),
    text: z.string().optional(),
    content: z.array(richTextNodeSchema).optional(),
  }),
);

export const descriptionDocSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(richTextNodeSchema).default([]),
  })
  .nullable();

function periodKeyRefinement(data: { level: (typeof PLANNING_LEVELS)[number]; periodKey: string }) {
  return isValidPeriodKey(data.level, data.periodKey);
}

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(300),
    level: planningLevelSchema,
    periodKey: z.string().min(1).max(16),
    scheduledDate: dateKeySchema.nullish(),
    scheduledTime: timeSchema.nullish(),
    estimatedMinutes: z.number().int().min(1).max(24 * 60).nullish(),
    description: descriptionDocSchema.optional(),
  })
  .refine(periodKeyRefinement, { message: "periodKey is not a valid period for this level", path: ["periodKey"] })
  .refine((data) => !data.scheduledTime || data.scheduledDate, {
    message: "scheduledTime requires scheduledDate",
    path: ["scheduledTime"],
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    completed: z.boolean().optional(),
    description: descriptionDocSchema.optional(),
    estimatedMinutes: z.number().int().min(1).max(24 * 60).nullish(),
    scheduledDate: dateKeySchema.nullish(),
    scheduledTime: timeSchema.nullish(),
    remindAt: z.string().datetime().nullish(),
    order: z.number().finite().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "No fields to update");

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const listTasksQuerySchema = z.object({
  level: planningLevelSchema,
  periodKey: z.string().min(1).max(16),
  includeCompleted: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v !== "false"),
});

export const moveTaskSchema = z
  .object({
    level: planningLevelSchema,
    periodKey: z.string().min(1).max(16),
  })
  .refine(periodKeyRefinement, { message: "periodKey is not a valid period for this level", path: ["periodKey"] });

export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

export const importTaskSchema = z
  .object({
    sourceTaskId: z.string().min(1),
    level: planningLevelSchema,
    periodKey: z.string().min(1).max(16),
    title: z.string().trim().min(1).max(300).optional(),
  })
  .refine(periodKeyRefinement, { message: "periodKey is not a valid period for this level", path: ["periodKey"] });

export type ImportTaskInput = z.infer<typeof importTaskSchema>;

export const breakDownItemSchema = z.object({
  title: z.string().trim().min(1).max(300),
  level: planningLevelSchema,
  periodKey: z.string().min(1).max(16),
  scheduledDate: dateKeySchema.nullish(),
});

export const breakDownTaskSchema = z.object({
  items: z.array(breakDownItemSchema).min(1).max(30),
}).superRefine((data, ctx) => {
  data.items.forEach((item, index) => {
    if (!isValidPeriodKey(item.level, item.periodKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "periodKey is not a valid period for this level",
        path: ["items", index, "periodKey"],
      });
    }
  });
});

export type BreakDownTaskInput = z.infer<typeof breakDownTaskSchema>;

export const createSubtaskSchema = z.object({
  title: z.string().trim().min(1).max(300),
});

export const updateSubtaskSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    completed: z.boolean().optional(),
    order: z.number().finite().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "No fields to update");

export const linkPreviewQuerySchema = z.object({
  url: z.string().url().max(2048),
});
