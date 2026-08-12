"use client";

import { Search } from "lucide-react";

import { useCommandPalette } from "@/contexts/command-palette-context";

export function SearchBar() {
  const { setOpen } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      <span className="flex-1 text-left">Search Log Book...</span>
      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}