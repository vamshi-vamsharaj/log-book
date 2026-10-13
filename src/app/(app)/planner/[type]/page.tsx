import { notFound } from "next/navigation";

import { PlannerView } from "@/features/tasks/components/planner-view";
import { currentPeriodKey, isValidPeriodKey, levelFromSlug, localDateKey } from "@/lib/period";

interface PlannerPageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function PlannerPage({ params, searchParams }: PlannerPageProps) {
  const { type } = await params;
  const { period } = await searchParams;

  const level = levelFromSlug(type);
  if (!level) {
    notFound();
  }

  const today = localDateKey();
  const periodKey = period && isValidPeriodKey(level, period) ? period : currentPeriodKey(level, today);

  return <PlannerView level={level} periodKey={periodKey} />;
}
