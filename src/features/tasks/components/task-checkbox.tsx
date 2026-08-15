"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface TaskCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export function TaskCheckbox({ checked, onToggle }: TaskCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? "Mark task as not done" : "Mark task as done"}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50",
      )}
    >
      {checked ? <Check className="h-3 w-3" /> : null}
    </button>
  );
}