"use client";

import { useLinkPreview } from "@/features/tasks/queries/use-link-preview";

export function LinkPreviewCard({ url }: { url: string }) {
  const { data, isLoading } = useLinkPreview(url);

  if (isLoading) {
    return <div className="h-14 animate-pulse rounded-md border bg-muted" />;
  }

  if (!data || (!data.title && !data.description)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="block truncate rounded-md border px-3 py-2 text-sm text-primary hover:underline"
      >
        {url}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="block space-y-0.5 rounded-md border px-3 py-2 hover:bg-accent"
    >
      {data.title ? <p className="truncate text-sm font-medium">{data.title}</p> : null}
      {data.description ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">{data.description}</p>
      ) : null}
      <p className="text-xs text-muted-foreground">{data.siteName ?? url}</p>
    </a>
  );
}