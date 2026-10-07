"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe } from "lucide-react";

interface PreviewResponse {
  url: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  image: string | null;
}

export function LinkPreviewCard({ url }: { url: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["link-preview", url],
    queryFn: async (): Promise<PreviewResponse> => {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("preview failed");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return <div className="h-12 animate-pulse rounded-md bg-muted/60" />;
  }

  // No metadata available — fail gracefully to a plain link, never block saving.
  if (!data || (!data.title && !data.description)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-2 truncate rounded-md border border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{url}</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="block space-y-0.5 rounded-md border border-border/60 px-3 py-2 transition-colors hover:bg-accent"
    >
      {data.title ? <p className="truncate text-sm font-medium">{data.title}</p> : null}
      {data.description ? <p className="line-clamp-2 text-xs text-muted-foreground">{data.description}</p> : null}
      <p className="truncate text-xs text-muted-foreground/70">{data.siteName ?? new URL(url).hostname}</p>
    </a>
  );
}
