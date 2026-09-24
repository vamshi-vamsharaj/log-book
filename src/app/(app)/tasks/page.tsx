import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { TaskBacklog } from "@/features/tasks/components/task-backlog";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TasksPage() {
  return (
    <PageContainer title="Tasks" description="Capture what you need to do, whenever it comes to mind.">
      <TaskBacklog />
    </PageContainer>
  );
}
