import "server-only";

import { db } from "@/lib/db";
import type { Prisma, TransactionType } from "@prisma/client";
import type {
  CreateExpenseInput,
  CreateExpenseEntryInput,
  CreateRepaymentInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from "@/features/expenses/validations/expense.validation";

export const EXPENSE_SELECT = {
  id: true,
  userId: true,
  personName: true,
  type: true,
  amount: true,
  date: true,
  dueDate: true,
  note: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  entries: {
    orderBy: [{ date: "desc" as const }, { createdAt: "desc" as const }],
    select: {
      id: true,
      expenseId: true,
      amount: true,
      date: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  repayments: {
    orderBy: [{ date: "desc" as const }, { createdAt: "desc" as const }],
    select: {
      id: true,
      expenseId: true,
      amount: true,
      date: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.ExpenseSelect;

export function findOwnedExpense(userId: string, id: string) {
  return db.expense.findFirst({
    where: { id, userId, deletedAt: null },
    select: EXPENSE_SELECT,
  });
}

export function findExpenseByPerson(
  userId: string,
  personName: string,
  type: TransactionType = "LENT",
) {
  return db.expense.findFirst({
    where: {
      userId,
      deletedAt: null,
      type,
      personName: { equals: personName.trim(), mode: "insensitive" },
    },
    select: EXPENSE_SELECT,
  });
}

export function listExpenses(userId: string, filters?: ListExpensesQuery) {
  const where: Prisma.ExpenseWhereInput = {
    userId,
    deletedAt: null,
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.type ? { type: filters.type } : {}),
    ...(filters?.personName
      ? { personName: { contains: filters.personName, mode: "insensitive" } }
      : {}),
    ...(filters?.search
      ? {
          OR: [
            { personName: { contains: filters.search, mode: "insensitive" } },
            { note: { contains: filters.search, mode: "insensitive" } },
            {
              entries: {
                some: {
                  note: { contains: filters.search, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  };

  return db.expense.findMany({
    where,
    select: EXPENSE_SELECT,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export function createExpense(userId: string, data: CreateExpenseInput) {
  return db.expense.create({
    data: {
      userId,
      personName: data.personName.trim(),
      amount: data.amount,
      date: data.date,
      dueDate: data.dueDate ?? null,
      note: data.note ?? null,
      type: data.type ?? "LENT",
      status: "PENDING",
      entries: {
        create: {
          amount: data.amount,
          date: data.date,
          note: data.note ?? null,
        },
      },
    },
    select: EXPENSE_SELECT,
  });
}

export function updateExpense(id: string, data: UpdateExpenseInput) {
  return db.expense.update({
    where: { id },
    data: {
      ...(data.personName ? { personName: data.personName.trim() } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.date ? { date: data.date } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
      ...(data.note !== undefined ? { note: data.note } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.type ? { type: data.type } : {}),
    },
    select: EXPENSE_SELECT,
  });
}

export function softDeleteExpense(id: string) {
  return db.expense.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true },
  });
}

export function createExpenseEntry(expenseId: string, data: CreateExpenseEntryInput) {
  return db.expenseEntry.create({
    data: {
      expenseId,
      amount: data.amount,
      date: data.date,
      note: data.note ?? null,
    },
  });
}

export function findExpenseEntry(id: string) {
  return db.expenseEntry.findUnique({
    where: { id },
    include: { expense: true },
  });
}

export function deleteExpenseEntry(id: string) {
  return db.expenseEntry.delete({
    where: { id },
  });
}

export function createRepayment(expenseId: string, data: CreateRepaymentInput) {
  return db.repayment.create({
    data: {
      expenseId,
      amount: data.amount,
      date: data.date,
      note: data.note ?? null,
    },
  });
}

export function findRepayment(id: string) {
  return db.repayment.findUnique({
    where: { id },
    include: { expense: true },
  });
}

export function deleteRepayment(id: string) {
  return db.repayment.delete({
    where: { id },
  });
}
