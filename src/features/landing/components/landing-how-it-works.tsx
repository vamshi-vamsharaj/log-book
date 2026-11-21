"use client";

import { CheckCircle2 } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Map Your Horizons",
      description:
        "Draft your major milestones across quarters and months. Break ambitious goals down into weekly priorities without duplicate work.",
      tag: "Vision",
    },
    {
      number: "02",
      title: "Focus on Today",
      description:
        "Execute your daily agenda with keyboard shortcuts and a focus timer. Stash unscheduled thoughts in the holding area sidebar.",
      tag: "Execution",
    },
    {
      number: "03",
      title: "Let Continuity Take Over",
      description:
        "Any task you don't complete today automatically rolls into tomorrow with a clear carry-forward badge until marked done, skipped, or moved.",
      tag: "Momentum",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-border/50 bg-muted/10 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            Simple 3-Step Methodology
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How Log-Book keeps you in flow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            A frictionless cadence designed to eliminate task anxiety and keep your long-term roadmap in alignment.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-8 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-extrabold text-primary/40">
                    {step.number}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {step.tag}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 flex items-center text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" />
                <span>Zero friction setup</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
