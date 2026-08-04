import { FLAT_NAVIGATION_ITEMS, type NavigationItem } from "@/config/navigation";

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavigationItem(pathname: string): NavigationItem | undefined {
  return FLAT_NAVIGATION_ITEMS.find((item) => isRouteActive(pathname, item.href));
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

function titleCase(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const matchedItem = FLAT_NAVIGATION_ITEMS.find((item) => item.href === href);

    return {
      title: matchedItem?.title ?? titleCase(segment),
      href,
    };
  });
}