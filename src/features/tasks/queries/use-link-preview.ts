"use client";

import { useQuery } from "@tanstack/react-query";

import { linkPreviewKeys } from "@/features/tasks/queries/keys";
import type { LinkPreviewDTO } from "@/features/tasks/types";

async function fetchLinkPreview(url: string): Promise<LinkPreviewDTO | null> {
  const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function useLinkPreview(url: string) {
  return useQuery({
    queryKey: linkPreviewKeys.preview(url),
    queryFn: () => fetchLinkPreview(url),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}