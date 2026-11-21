"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

import { APP_NAME } from "@/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">{APP_NAME}</span>
            </Link>
            <p className="max-w-sm text-xs text-muted-foreground">
              A personal productivity operating system for tasks, goals, habits, and focus.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-foreground transition-colors">
              Interactive Demo
            </a>
            <a href="#carry-forward" className="hover:text-foreground transition-colors">
              Carry-Forward
            </a>
            <a href="#expenses" className="hover:text-foreground transition-colors">
              Expense Tracker
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>

          {/* Theme toggle & status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>All systems operational</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <p>© {currentYear} {APP_NAME}. Built with modern Next.js and Tailwind CSS.</p>
          <p className="mt-2 sm:mt-0">Zero compromise on speed, privacy, and focus.</p>
        </div>
      </div>
    </footer>
  );
}
