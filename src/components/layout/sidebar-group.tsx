import { SidebarItem } from "@/components/layout/sidebar-item";
import type { NavigationGroup } from "@/config/navigation";

interface SidebarGroupProps {
  group: NavigationGroup;
  collapsed: boolean;
}

export function SidebarGroup({ group, collapsed }: SidebarGroupProps) {
  return (
    <div className="space-y-1">
      {!collapsed ? (
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {group.label}
        </h3>
      ) : null}
      <nav className="space-y-0.5" aria-label={group.label}>
        {group.items.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </div>
  );
}