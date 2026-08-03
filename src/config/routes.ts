export const APP_ROUTES = {
  dashboard: "/dashboard",
  tasks: "/tasks",
  calendar: "/calendar",
  goals: "/goals",
  habits: "/habits",
  planner: "/planner",
  plannerDay: "/planner/day",
  plannerWeek: "/planner/week",
  plannerMonth: "/planner/month",
  plannerQuarter: "/planner/quarter",
  plannerSixMonth: "/planner/six-month",
  plannerYear: "/planner/year",
  notes: "/notes",
  journal: "/journal",
  analytics: "/analytics",
  settings: "/settings",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];