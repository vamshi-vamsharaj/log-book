import { AppError } from "@/lib/errors";
import * as repo from "@/features/expenses/repositories/expense.repository";
import type {
  CreateExpenseInput,
  CreateExpenseEntryInput,
  CreateRepaymentInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from "@/features/expenses/validations/expense.validation";
import type { ExpenseDTO, ExpenseStatsDTO, RepaymentStatus } from "@/features/expenses/types";

function computeRepaymentStatus(totalAmount: number, repaidAmount: number): RepaymentStatus {
  if (repaidAmount >= totalAmount - 0.001) {
    return "FULLY_REPAID";
  }
  if (repaidAmount > 0) {
    return "PARTIALLY_REPAID";
  }
  return "PENDING";
}

function toDTO(raw: NonNullable<Awaited<ReturnType<typeof repo.findOwnedExpense>>>): ExpenseDTO {
  const rawEntries = raw.entries ?? [];
  const rawRepayments = raw.repayments ?? [];

  // If no entries exist yet (legacy record), provide fallback initial entry
  const entries =
    rawEntries.length > 0
      ? rawEntries.map((e) => ({
          id: e.id,
          expenseId: e.expenseId,
          amount: Number(e.amount.toFixed(2)),
          date: e.date,
          note: e.note,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        }))
      : [
          {
            id: `${raw.id}-initial`,
            expenseId: raw.id,
            amount: Number(raw.amount.toFixed(2)),
            date: raw.date,
            note: raw.note,
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
          },
        ];

  const totalLent =
    rawEntries.length > 0
      ? rawEntries.reduce((sum, e) => sum + e.amount, 0)
      : raw.amount;

  const repaidAmount = rawRepayments.reduce((sum, r) => sum + r.amount, 0);
  const remainingBalance = Math.max(0, Number((totalLent - repaidAmount).toFixed(2)));
  const status = computeRepaymentStatus(totalLent, repaidAmount);

  return {
    id: raw.id,
    userId: raw.userId,
    personName: raw.personName,
    type: raw.type,
    amount: Number(totalLent.toFixed(2)),
    date: raw.date,
    dueDate: raw.dueDate,
    note: raw.note,
    status,
    repaidAmount: Number(repaidAmount.toFixed(2)),
    remainingBalance,
    entries,
    repayments: rawRepayments.map((r) => ({
      id: r.id,
      expenseId: r.expenseId,
      amount: Number(r.amount.toFixed(2)),
      date: r.date,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

export async function listExpenses(userId: string, filters?: ListExpensesQuery): Promise<ExpenseDTO[]> {
  const records = await repo.listExpenses(userId, filters);
  return records.map(toDTO);
}

export async function getExpense(userId: string, id: string): Promise<ExpenseDTO> {
  const record = await repo.findOwnedExpense(userId, id);
  if (!record) {
    throw AppError.notFound("Expense record not found");
  }
  return toDTO(record);
}

export async function createExpense(userId: string, data: CreateExpenseInput): Promise<ExpenseDTO> {
  // If an active record already exists for this person, add money to their existing record!
  const existing = await repo.findExpenseByPerson(userId, data.personName, data.type ?? "LENT");
  if (existing) {
    return addExpenseEntry(userId, existing.id, {
      amount: data.amount,
      date: data.date,
      note: data.note ?? null,
    });
  }

  const record = await repo.createExpense(userId, data);
  return toDTO(record);
}

export async function updateExpense(
  userId: string,
  id: string,
  data: UpdateExpenseInput,
): Promise<ExpenseDTO> {
  const existing = await repo.findOwnedExpense(userId, id);
  if (!existing) {
    throw AppError.notFound("Expense record not found");
  }

  const updated = await repo.updateExpense(id, data);
  return toDTO(updated);
}

export async function deleteExpense(userId: string, id: string): Promise<{ success: boolean }> {
  const existing = await repo.findOwnedExpense(userId, id);
  if (!existing) {
    throw AppError.notFound("Expense record not found");
  }

  await repo.softDeleteExpense(id);
  return { success: true };
}

/** Add a new lending entry (more money) to an existing person */
export async function addExpenseEntry(
  userId: string,
  expenseId: string,
  data: CreateExpenseEntryInput,
): Promise<ExpenseDTO> {
  const existing = await repo.findOwnedExpense(userId, expenseId);
  if (!existing) {
    throw AppError.notFound("Expense record not found");
  }

  // If this record had no entries yet (legacy), backfill the original first entry
  if (existing.entries.length === 0) {
    await repo.createExpenseEntry(expenseId, {
      amount: existing.amount,
      date: existing.date,
      note: existing.note,
    });
  }

  // Create the new lending entry
  await repo.createExpenseEntry(expenseId, data);

  // Re-fetch all entries and repayments
  const refreshed = await repo.findOwnedExpense(userId, expenseId);
  if (!refreshed) {
    throw AppError.notFound("Expense record not found");
  }

  const newTotalLent = refreshed.entries.reduce((sum, e) => sum + e.amount, 0);
  const totalRepaid = refreshed.repayments.reduce((sum, r) => sum + r.amount, 0);
  const newStatus = computeRepaymentStatus(newTotalLent, totalRepaid);

  // Update cached amount and status
  await repo.updateExpense(expenseId, {
    amount: newTotalLent,
    status: newStatus,
  });

  refreshed.amount = newTotalLent;
  refreshed.status = newStatus;

  return toDTO(refreshed);
}

/** Delete an individual lending entry from a person */
export async function deleteExpenseEntry(
  userId: string,
  expenseId: string,
  entryId: string,
): Promise<ExpenseDTO> {
  const existing = await repo.findOwnedExpense(userId, expenseId);
  if (!existing) {
    throw AppError.notFound("Expense record not found");
  }

  const entry = await repo.findExpenseEntry(entryId);
  if (!entry || entry.expenseId !== expenseId) {
    throw AppError.notFound("Lending entry not found");
  }

  await repo.deleteExpenseEntry(entryId);

  const refreshed = await repo.findOwnedExpense(userId, expenseId);
  if (!refreshed) {
    throw AppError.notFound("Expense record not found");
  }

  const newTotalLent = refreshed.entries.reduce((sum, e) => sum + e.amount, 0);
  const totalRepaid = refreshed.repayments.reduce((sum, r) => sum + r.amount, 0);
  const newStatus = computeRepaymentStatus(newTotalLent, totalRepaid);

  await repo.updateExpense(expenseId, {
    amount: newTotalLent,
    status: newStatus,
  });

  refreshed.amount = newTotalLent;
  refreshed.status = newStatus;

  return toDTO(refreshed);
}

export async function addRepayment(
  userId: string,
  expenseId: string,
  data: CreateRepaymentInput,
): Promise<ExpenseDTO> {
  const expense = await repo.findOwnedExpense(userId, expenseId);
  if (!expense) {
    throw AppError.notFound("Expense record not found");
  }

  // Create repayment
  await repo.createRepayment(expenseId, data);

  // Re-fetch and recalculate status
  const refreshed = await repo.findOwnedExpense(userId, expenseId);
  if (!refreshed) {
    throw AppError.notFound("Expense record not found");
  }

  const totalLent =
    refreshed.entries.length > 0
      ? refreshed.entries.reduce((sum, e) => sum + e.amount, 0)
      : refreshed.amount;

  const currentRepaid = refreshed.repayments.reduce((sum, r) => sum + r.amount, 0);
  const newStatus = computeRepaymentStatus(totalLent, currentRepaid);

  if (newStatus !== refreshed.status) {
    await repo.updateExpense(expenseId, { status: newStatus });
    refreshed.status = newStatus;
  }

  return toDTO(refreshed);
}

export async function deleteRepayment(
  userId: string,
  expenseId: string,
  repaymentId: string,
): Promise<ExpenseDTO> {
  const expense = await repo.findOwnedExpense(userId, expenseId);
  if (!expense) {
    throw AppError.notFound("Expense record not found");
  }

  const repayment = await repo.findRepayment(repaymentId);
  if (!repayment || repayment.expenseId !== expenseId) {
    throw AppError.notFound("Repayment not found");
  }

  await repo.deleteRepayment(repaymentId);

  const refreshed = await repo.findOwnedExpense(userId, expenseId);
  if (!refreshed) {
    throw AppError.notFound("Expense record not found");
  }

  const totalLent =
    refreshed.entries.length > 0
      ? refreshed.entries.reduce((sum, e) => sum + e.amount, 0)
      : refreshed.amount;

  const currentRepaid = refreshed.repayments.reduce((sum, r) => sum + r.amount, 0);
  const newStatus = computeRepaymentStatus(totalLent, currentRepaid);

  if (newStatus !== refreshed.status) {
    await repo.updateExpense(expenseId, { status: newStatus });
    refreshed.status = newStatus;
  }

  return toDTO(refreshed);
}

export async function getExpenseStats(userId: string): Promise<ExpenseStatsDTO> {
  const allRecords = await repo.listExpenses(userId);

  let totalLent = 0;
  let totalRecovered = 0;
  let fullyRepaidCount = 0;
  const activeDebtors = new Set<string>();

  for (const record of allRecords) {
    const lent =
      record.entries.length > 0
        ? record.entries.reduce((sum, e) => sum + e.amount, 0)
        : record.amount;

    const repaid = record.repayments.reduce((sum, r) => sum + r.amount, 0);
    const balance = Math.max(0, lent - repaid);

    if (record.type === "LENT") {
      totalLent += lent;
      totalRecovered += repaid;
    }

    if (repaid >= lent - 0.001 || balance <= 0.001) {
      fullyRepaidCount += 1;
    } else {
      activeDebtors.add(record.personName.trim().toLowerCase());
    }
  }

  const totalOutstanding = Math.max(0, Number((totalLent - totalRecovered).toFixed(2)));

  return {
    totalLent: Number(totalLent.toFixed(2)),
    totalRecovered: Number(totalRecovered.toFixed(2)),
    totalOutstanding,
    activeDebtorsCount: activeDebtors.size,
    totalTransactionsCount: allRecords.length,
    fullyRepaidCount,
  };
}
