import {
  BarChart3,
  BookOpen,
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  LayoutDashboard,
  ListChecks,
  NotebookText,
  Repeat,
  Settings,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";

import { APP_ROUTES } from "@/config/routes";

export type NavigationGroupKey =
  | "overview"
  | "planning"
  | "productivity"
  | "knowledge"
  | "insights"
  | "system";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  group: NavigationGroupKey;
  description: string;
}

export interface NavigationGroup {
  key: NavigationGroupKey;
  label: string;
  items: NavigationItem[];
}

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    key: "overview",
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: APP_ROUTES.dashboard,
        icon: LayoutDashboard,
        group: "overview",
        description: "Your daily productivity snapshot",
      },
    ],
  },
  {
    key: "planning",
    label: "Planning",
    items: [
      {
        title: "Today",
        href: APP_ROUTES.plannerDay,
        icon: Sun,
        group: "planning",
        description: "Plan your day",
      },
      {
        title: "Week",
        href: APP_ROUTES.plannerWeek,
        icon: CalendarDays,
        group: "planning",
        description: "Plan your week",
      },
      {
        title: "Month",
        href: APP_ROUTES.plannerMonth,
        icon: CalendarRange,
        group: "planning",
        description: "Plan your month",
      },
      {
        title: "Quarter",
        href: APP_ROUTES.plannerQuarter,
        icon: CalendarClock,
        group: "planning",
        description: "Plan your quarter",
      },
      {
        title: "Six Months",
        href: APP_ROUTES.plannerSixMonth,
        icon: CalendarPlus,
        group: "planning",
        description: "Plan six months ahead",
      },
      {
        title: "Year",
        href: APP_ROUTES.plannerYear,
        icon: CalendarCheck,
        group: "planning",
        description: "Plan your year",
      },
    ],
  },
  {
    key: "productivity",
    label: "Productivity",
    items: [
      {
        title: "Tasks",
        href: APP_ROUTES.tasks,
        icon: ListChecks,
        group: "productivity",
        description: "Manage your tasks",
      },
      {
        title: "Calendar",
        href: APP_ROUTES.calendar,
        icon: CalendarIcon,
        group: "productivity",
        description: "View your schedule",
      },
      {
        title: "Goals",
        href: APP_ROUTES.goals,
        icon: Target,
        group: "productivity",
        description: "Track your goals",
      },
      {
        title: "Habits",
        href: APP_ROUTES.habits,
        icon: Repeat,
        group: "productivity",
        description: "Build consistent habits",
      },
    ],
  },
  {
    key: "knowledge",
    label: "Knowledge",
    items: [
      {
        title: "Notes",
        href: APP_ROUTES.notes,
        icon: NotebookText,
        group: "knowledge",
        description: "Capture your notes",
      },
      {
        title: "Journal",
        href: APP_ROUTES.journal,
        icon: BookOpen,
        group: "knowledge",
        description: "Reflect on your day",
      },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    items: [
      {
        title: "Analytics",
        href: APP_ROUTES.analytics,
        icon: BarChart3,
        group: "insights",
        description: "Understand your productivity",
      },
    ],
  },
  {
    key: "system",
    label: "System",
    items: [
      {
        title: "Settings",
        href: APP_ROUTES.settings,
        icon: Settings,
        group: "system",
        description: "Configure Log Book",
      },
    ],
  },
];

export const FLAT_NAVIGATION_ITEMS: NavigationItem[] = NAVIGATION_GROUPS.flatMap(
  (group) => group.items,
);