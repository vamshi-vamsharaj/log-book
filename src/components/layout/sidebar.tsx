"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";

import { SidebarGroup } from "@/components/layout/sidebar-group";
import { Button } from "@/components/ui/button";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { APP_NAME } from "@/constants";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-background transition-all duration-200 md:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b px-3">
        {!collapsed ? (
          <Link href="/dashboard" className="truncate text-sm font-semibold">
            {APP_NAME}
          </Link>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        {NAVIGATION_GROUPS.map((group) => (
          <SidebarGroup key={group.key} group={group} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  );
}