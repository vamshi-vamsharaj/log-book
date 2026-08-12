"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getBreadcrumbItems } from "@/lib/navigation";

export function Breadcrumb() {
  const pathname = usePathname();
  const items = getBreadcrumbItems(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Dashboard</span>
      </Link>
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.title}</span>
          ) : (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}