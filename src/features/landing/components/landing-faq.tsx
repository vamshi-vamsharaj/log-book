"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "How does the Carry-Forward task feature work?",
      answer:
        "When you schedule a task for a specific day and don't complete it, Log-Book ensures it remains visible on every day from the original scheduled date through today. It displays a distinct badge (e.g. 'Carried forward from Monday') so you know where it started. Once you complete, skip, or reschedule the task, it resolves cleanly without creating any duplicate records in your database.",
    },
    {
      question: "What is the Unscheduled Task Holding Area?",
      answer:
        "It is a collapsible right sidebar accessible from both the Calendar and Day Planner. It acts as an inbox holding area where you can quickly write down ideas and tasks without picking a date. Whenever you decide to tackle them, simply click or drag them into today or any target calendar date.",
    },
    {
      question: "How does the Expense Tracker handle lending money?",
      answer:
        "You can record money you lend to friends or colleagues. If you lend more money to the same person later (e.g., ₹1,000 on Nov 1, then ₹500 on Nov 5), you can add the new transaction directly to their existing record. Their combined outstanding balance becomes ₹1,500 automatically, and partial or full repayments adjust the remaining balance with complete audit history.",
    },
    {
      question: "What are the 6 Planning Horizons?",
      answer:
        "Log-Book supports Year, 6-Month, Quarter, Month, Week, and Day. Rather than copying tasks between horizons, Log-Book lets you break down higher-level objectives into lower-level periods with explicit links, maintaining full traceability from yearly vision to daily execution.",
    },
    {
      question: "Is Log-Book free to use?",
      answer:
        "Yes, Log-Book offers a generous free tier with unlimited tasks, 6 horizons, the intelligent carry-forward engine, and the personal expense tracker. No credit card is required to sign up.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "All data is encrypted in transit and at rest using modern PostgreSQL database storage on Neon with Better Auth secure session authentication. Your personal tasks and financial records are strictly scoped to your private account.",
    },
  ];

  function toggleFaq(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section id="faq" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            Frequently Asked Questions
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to know
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Have questions about how Log-Book fits into your daily routine? We&apos;ve got answers.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-border/70 bg-card transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary sm:text-base"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-primary",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border/50 px-5 pt-3 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
