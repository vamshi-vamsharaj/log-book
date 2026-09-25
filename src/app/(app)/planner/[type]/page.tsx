import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { PLANNER_SLUG_TO_LEVEL } from "@/lib/period";

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
  const level = PLANNER_SLUG_TO_LEVEL[type];

  if (!level) {
    notFound();
  }

  return (
    <PageContainer title={PLANNER_TITLES[type]} description="What do you want to accomplish in this period?">
      <TaskBoard level={level} />
    </PageContainer>
  );
}
