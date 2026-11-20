"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card to-primary/[0.05] p-8 text-center shadow-2xl sm:p-14">
          {/* Subtle decorative radial glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Ready for Calm Execution?
          </div>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Transform your planning into effortless momentum.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Join planners who have stopped losing tasks into the past. Create your free Log-Book account today.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-md">
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
              <Link href="/sign-in">Sign In to Account</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Full export access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
