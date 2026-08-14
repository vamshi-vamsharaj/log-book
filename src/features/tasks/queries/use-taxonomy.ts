"use client";

import { useQuery } from "@tanstack/react-query";
import type { Category, Label, Tag } from "@prisma/client";

import { taxonomyKeys } from "@/features/tasks/queries/keys";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.json();
}

export function useCategories() {
  return useQuery({
    queryKey: taxonomyKeys.categories,
    queryFn: () => fetchJson<Category[]>("/api/tasks/categories"),
  });
}

export function useLabels() {
  return useQuery({
    queryKey: taxonomyKeys.labels,
    queryFn: () => fetchJson<Label[]>("/api/tasks/labels"),
  });
}

export function useTags() {
  return useQuery({
    queryKey: taxonomyKeys.tags,
    queryFn: () => fetchJson<Tag[]>("/api/tasks/tags"),
  });
}