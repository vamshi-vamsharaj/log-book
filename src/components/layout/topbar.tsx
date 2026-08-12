import { Bell } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchBar } from "@/components/layout/search-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MobileNav />
      <Breadcrumb />
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:block">
          <SearchBar />
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}