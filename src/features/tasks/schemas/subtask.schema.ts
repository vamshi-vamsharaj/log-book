import { z } from "zod";

export const createSubtaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000).optional().nullable(),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

export const updateSubtaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    completed: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "No fields provided to update");

export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;