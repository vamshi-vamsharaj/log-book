"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPaletteProvider } from "@/contexts/command-palette-context";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}