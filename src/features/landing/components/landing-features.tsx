"use client";

import {
  Clock,
  HandCoins,
  Inbox,
  Layers,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: RotateCcw,
      title: "Intelligent Carry-Forward Engine",
      description:
        "Incomplete tasks don't vanish into yesterday. They stay visible across every day from the original date through today until completed, skipped, or rescheduled—with zero duplicate entries.",
      badge: "Core Innovation",
      highlight: true,
    },
    {
      icon: Layers,
      title: "6-Horizon Planning Hierarchy",
      description:
        "Connect high-level aspirations to daily execution. Seamlessly zoom across Year, 6-Month, Quarter, Month, Week, and Day without losing context or cluttering your board.",
      badge: "Structure",
    },
    {
      icon: Inbox,
      title: "Unscheduled Task Holding Area",
      description:
        "A collapsible sidebar inbox on both Calendar and Day Planner. Capture raw thoughts and tasks without setting a date, then drag or schedule them into today when ready.",
      badge: "Flow",
    },
    {
      icon: HandCoins,
      title: "Personal Lending & Expense Tracker",
      description:
        "Track money lent to friends and colleagues. Add multiple lending entries to the same person without creating duplicate contacts, track repayments, and see exact net balances.",
      badge: "Financial Clarity",
      highlight: true,
    },
    {
      icon: Clock,
      title: "Built-In Focus Timer & Estimates",
      description:
        "Estimate durations, track live execution time with start/pause controls, and view actual seconds spent right alongside your subtasks and notes.",
      badge: "Productivity",
    },
    {
      icon: Zap,
      title: "Sub-100ms Keyboard-First UX",
      description:
        "Instant inline task creation, keyboard shortcuts, optimistic cache updates with TanStack Query, and distraction-free dark and light themes.",
      badge: "Performance",
    },
  ];

  return (
    <section id="features" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Purpose-Built Architecture
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to plan, execute, and stay balanced.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Most productivity apps force you to pick between high-level roadmaps or daily checklists.
            Log-Book seamlessly unifies both with unique carry-forward intelligence and personal financial tracking.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  feature.highlight
                    ? "border-primary/40 bg-gradient-to-b from-card via-card to-primary/[0.03] shadow-xs"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-semibold text-primary">
                  <span>Explore capability</span>
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
