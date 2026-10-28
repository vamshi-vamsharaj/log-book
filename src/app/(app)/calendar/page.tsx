import type { Metadata } from "next";

import { CalendarView } from "@/features/calendar/components/calendar-view";

export const metadata: Metadata = {
  title: "Calendar",
  description: "View and manage your scheduled tasks across Month, Week, Day, and Agenda views.",
};

export default function CalendarPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <CalendarView />
    </div>
  );
}