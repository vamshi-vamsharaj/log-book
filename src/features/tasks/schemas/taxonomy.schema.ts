import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(60, "Name is too long"),
  description: z.string().max(300).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value")
    .default("#6366f1"),
  icon: z.string().max(60).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "No fields provided to update",
);

export const createLabelSchema = z.object({
  name: z.string().min(1, "Name is required").max(60, "Name is too long"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value")
    .default("#f43f5e"),
});

export const updateLabelSchema = createLabelSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "No fields provided to update",
);

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(40, "Name is too long")
    .transform((value) => value.trim().toLowerCase()),
});

export const updateTagSchema = createTagSchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;