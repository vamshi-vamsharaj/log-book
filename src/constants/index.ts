export const APP_NAME = "Log Book";

export const APP_DESCRIPTION =
  "A personal productivity operating system for tasks, goals, habits, and focus.";

export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
} as const;

export type RouteKey = keyof typeof ROUTES;