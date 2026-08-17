import { z } from "zod";

export const updateReminderSchema = z
  .object({
    enabled: z.boolean(),
    offsetMinutes: z.number().int().min(0).max(1440).optional().nullable(),
    customRemindAt: z.coerce.date().optional().nullable(),
  })
  .refine(
    (value) => !value.enabled || value.offsetMinutes !== undefined || value.customRemindAt,
    "Provide either an offset or a custom reminder time when enabling notifications",
  );

export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;