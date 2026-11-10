import { z } from "zod";

import { isValidDateKey } from "@/lib/period";

export const transactionTypeSchema = z.enum(["LENT", "BORROWED", "EXPENSE"]);
export const repaymentStatusSchema = z.enum(["PENDING", "PARTIALLY_REPAID", "FULLY_REPAID"]);

export const dateKeySchema = z
  .string()
  .refine((v) => isValidDateKey(v), { message: "Date must be YYYY-MM-DD" });

export const createExpenseSchema = z.object({
  personName: z.string().trim().min(1, "Person name is required").max(100),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: dateKeySchema,
  dueDate: dateKeySchema.nullish(),
  note: z.string().trim().max(500).nullish(),
  type: transactionTypeSchema.default("LENT"),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z
  .object({
    personName: z.string().trim().min(1).max(100).optional(),
    amount: z.coerce.number().positive().optional(),
    date: dateKeySchema.optional(),
    dueDate: dateKeySchema.nullish(),
    note: z.string().trim().max(500).nullish(),
    status: repaymentStatusSchema.optional(),
    type: transactionTypeSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "No fields to update");

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export const createExpenseEntrySchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: dateKeySchema,
  note: z.string().trim().max(500).nullish(),
});

export type CreateExpenseEntryInput = z.infer<typeof createExpenseEntrySchema>;

export const createRepaymentSchema = z.object({
  amount: z.coerce.number().positive("Repayment amount must be greater than zero"),
  date: dateKeySchema,
  note: z.string().trim().max(500).nullish(),
});

export type CreateRepaymentInput = z.infer<typeof createRepaymentSchema>;

export const listExpensesQuerySchema = z.object({
  status: repaymentStatusSchema.optional(),
  type: transactionTypeSchema.optional(),
  personName: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
