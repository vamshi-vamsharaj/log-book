"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  CreateExpenseInput,
  CreateExpenseEntryInput,
  CreateRepaymentInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from "@/features/expenses/validations/expense.validation";
import type { ExpenseDTO, ExpenseStatsDTO } from "@/features/expenses/types";

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters?: ListExpensesQuery) => [...expenseKeys.lists(), filters ?? {}] as const,
  stats: () => [...expenseKeys.all, "stats"] as const,
  detail: (id: string) => [...expenseKeys.all, "detail", id] as const,
};

export function useExpenses(filters?: ListExpensesQuery) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.personName) params.set("personName", filters.personName);
  if (filters?.search) params.set("search", filters.search);

  const queryStr = params.toString();
  const url = queryStr ? `/api/expenses?${queryStr}` : "/api/expenses";

  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => api.get<ExpenseDTO[]>(url),
    staleTime: 30 * 1000,
  });
}

export function useExpenseStats() {
  return useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: () => api.get<ExpenseStatsDTO>("/api/expenses/stats"),
    staleTime: 30 * 1000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) => api.post<ExpenseDTO>("/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      api.patch<ExpenseDTO>(`/api/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

/** Add another lending transaction / more money to an existing person */
export function useAddExpenseEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      expenseId,
      data,
    }: {
      expenseId: string;
      data: CreateExpenseEntryInput;
    }) => api.post<ExpenseDTO>(`/api/expenses/${expenseId}/entries`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

/** Delete an individual lending transaction from a person */
export function useDeleteExpenseEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      expenseId,
      entryId,
    }: {
      expenseId: string;
      entryId: string;
    }) => api.delete<ExpenseDTO>(`/api/expenses/${expenseId}/entries/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useAddRepayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: CreateRepaymentInput }) =>
      api.post<ExpenseDTO>(`/api/expenses/${expenseId}/repayments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useDeleteRepayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, repaymentId }: { expenseId: string; repaymentId: string }) =>
      api.delete<ExpenseDTO>(`/api/expenses/${expenseId}/repayments/${repaymentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}
