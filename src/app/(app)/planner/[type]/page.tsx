import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";

const PLANNER_TITLES: Record<string, string> = {
  day: "Day Planner",
  week: "Week Planner",
  month: "Month Planner",
  quarter: "Quarter Planner",
  "six-month": "Six Month Planner",
  year: "Year Planner",
};

interface PlannerTypePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: PlannerTypePageProps): Promise<Metadata> {
  const { type } = await params;
  return { title: PLANNER_TITLES[type] ?? "Planner" };
}

export default async function PlannerTypePage({ params }: PlannerTypePageProps) {
  const { type } = await params;
  const title = PLANNER_TITLES[type];

  if (!title) {
    notFound();
  }

  return (
    <PageContainer title={title} description="Structured planning for this timeframe.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        The {title.toLowerCase()} editor will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}