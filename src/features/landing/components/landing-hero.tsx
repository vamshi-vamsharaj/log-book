"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Play, Sparkles, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background radial gradient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 to-blue-500/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-all hover:border-border">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="flex items-center gap-1 font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Log-Book 2.0
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Intelligent Carry-Forward & Expense Tracker</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.12]">
            Where high-level vision meets{" "}
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent">
              daily execution.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl sm:leading-relaxed">
            Plan across 6 horizons from Year down to Day. Seamlessly keep unscheduled thoughts in an
            inbox holding area, automatically carry unfinished work forward without clutter, and track money lent—all in one calm, unified workspace.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 px-7 text-base font-semibold shadow-md">
              <Link href="/sign-up">
                Start Organizing Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-border/80 px-7 text-base font-medium hover:bg-accent"
            >
              <a href="#demo">
                <Play className="mr-2 h-4 w-4 text-primary fill-primary/20" />
                Explore Interactive Demo
              </a>
            </Button>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span>Setup in 30 seconds</span>
            </div>
          </div>
        </div>

        {/* Highlight Metrics Strip */}
        <div className="mx-auto mt-16 max-w-5xl rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-border/60">
            <div className="text-center md:px-4">
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">6 Horizons</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Year, Quarter, Month, Week & Day</p>
            </div>
            <div className="text-center md:px-4">
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Zero Lost Tasks</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Intelligent carry-forward engine</p>
            </div>
            <div className="text-center md:px-4">
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Built-in Lending</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Track money lent & repayments</p>
            </div>
            <div className="text-center md:px-4">
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Sub-100ms</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Optimistic UI & instant response</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
