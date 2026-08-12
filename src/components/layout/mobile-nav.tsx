"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SidebarGroup } from "@/components/layout/sidebar-group";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAVIGATION_GROUPS } from "@/config/navigation";
import { APP_NAME } from "@/constants";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              {APP_NAME}
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-2 py-4" onClick={() => setOpen(false)}>
          {NAVIGATION_GROUPS.map((group) => (
            <SidebarGroup key={group.key} group={group} collapsed={false} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}