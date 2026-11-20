"use client";

import { Check, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

export function LandingCarryForwardShowcase() {
  return (
    <section id="carry-forward" className="scroll-mt-24 border-y border-border/50 bg-muted/20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Narrative */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-3.5 w-3.5" />
              Intelligent Carry-Forward
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              No task left behind. No duplicated clutter.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              In typical to-do lists, unfinished tasks either get buried in yesterday&apos;s date,
              requiring tedious manual rescheduling, or they copy endlessly and clutter your board with duplicates.
            </p>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Log-Book keeps unfinished tasks continuously visible from their scheduled date through the
              present moment. You always know where a task originated and how long it has been rolling forward.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                <span>Single source of truth: no duplicate records in the database.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                <span>Distinct amber badge clearly identifies carried tasks from today&apos;s planned work.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                <span>Instant actions: Complete, Skip, or Reschedule with a single keystroke.</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Visual Comparison Cards */}
          <div className="space-y-4">
            {/* Old Way */}
            <div className="rounded-2xl border border-destructive/20 bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-destructive">
                <span className="flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> The Old Way (Standard Apps)
                </span>
                <span className="text-muted-foreground">Monday ➜ Tuesday</span>
              </div>
              <div className="mt-3 space-y-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between line-through opacity-60">
                  <span>Monday: &ldquo;Submit quarterly tax forecast&rdquo;</span>
                  <span className="text-[10px]">Unfinished</span>
                </div>
                <div className="text-[11px] text-destructive/80 italic">
                  ⚠ Task disappeared into Monday&apos;s log. Forgot to follow up on Tuesday.
                </div>
              </div>
            </div>

            {/* Log-Book Way */}
            <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-md ring-1 ring-primary/20">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> The Log-Book Way
                </span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">Seamless Continuity</span>
              </div>
              <div className="mt-3 space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Submit quarterly tax forecast
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <RotateCcw className="h-3 w-3" />
                        Carried from Monday
                      </span>
                      <span className="text-muted-foreground">· Visible on Tuesday, Wednesday & Today</span>
                    </div>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border border-primary/50 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
