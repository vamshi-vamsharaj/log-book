"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { taxonomyKeys } from "@/features/tasks/queries/keys";
import type {
  CreateCategoryInput,
  CreateLabelInput,
  CreateTagInput,
  UpdateCategoryInput,
  UpdateLabelInput,
  UpdateTagInput,
} from "@/features/tasks/schemas/taxonomy.schema";

async function requestJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "Request failed");
  }

  return response.json();
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      requestJson("/api/tasks/categories", "POST", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.categories }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      requestJson(`/api/tasks/categories/${id}`, "PATCH", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.categories }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestJson(`/api/tasks/categories/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.categories }),
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLabelInput) => requestJson("/api/tasks/labels", "POST", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.labels }),
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLabelInput }) =>
      requestJson(`/api/tasks/labels/${id}`, "PATCH", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.labels }),
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestJson(`/api/tasks/labels/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.labels }),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => requestJson("/api/tasks/tags", "POST", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.tags }),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTagInput }) =>
      requestJson(`/api/tasks/tags/${id}`, "PATCH", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.tags }),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestJson(`/api/tasks/tags/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taxonomyKeys.tags }),
  });
}