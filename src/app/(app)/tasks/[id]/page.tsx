import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { TaskDetail } from "@/features/tasks/components/task-detail";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Task Detail",
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <TaskDetail taskId={id} />
    </PageContainer>
  );
}