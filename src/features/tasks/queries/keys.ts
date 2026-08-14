export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (query: Record<string, unknown>) => [...taskKeys.lists(), query] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  suggestions: (dateKey: string) => [...taskKeys.all, "suggestions", dateKey] as const,
  subtasks: (id: string) => [...taskKeys.detail(id), "subtasks"] as const,
  reminder: (id: string) => [...taskKeys.detail(id), "reminder"] as const,
  timer: (id: string) => [...taskKeys.detail(id), "timer"] as const,
};

export const linkPreviewKeys = {
  preview: (url: string) => ["link-preview", url] as const,
};