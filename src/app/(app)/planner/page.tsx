import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { NAVIGATION_GROUPS } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Planner",
};

export default function PlannerIndexPage() {
  const planningItems = NAVIGATION_GROUPS.find((group) => group.key === "planning")?.items ?? [];

  return (
    <PageContainer title="Planner" description="Choose a timeframe to plan.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {planningItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium">{item.title}</span>
              <span className="text-sm text-muted-foreground">{item.description}</span>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}