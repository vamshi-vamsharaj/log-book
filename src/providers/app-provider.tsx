"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPaletteProvider } from "@/contexts/command-palette-context";
import { UndoProvider } from "@/contexts/undo-context";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TooltipProvider delayDuration={200}>
          <CommandPaletteProvider>
            <UndoProvider>{children}</UndoProvider>
          </CommandPaletteProvider>
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}