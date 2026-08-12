import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <PageContainer title="Settings" description="Configure Log Book to fit how you work.">
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Settings will be implemented in a future phase.
      </div>
    </PageContainer>
  );
}