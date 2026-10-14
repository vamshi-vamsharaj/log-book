export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (query: Record<string, unknown>) => [...taskKeys.lists(), query] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  suggestions: (dateKey: string) => [...taskKeys.all, "suggestions", dateKey] as const,
};

export const linkPreviewKeys = {
  preview: (url: string) => ["link-preview", url] as const,
};

export const taxonomyKeys = {
  all: ["taxonomy"] as const,
  categories: ["taxonomy", "categories"] as const,
  labels: ["taxonomy", "labels"] as const,
  tags: ["taxonomy", "tags"] as const,
};
