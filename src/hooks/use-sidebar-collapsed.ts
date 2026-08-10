"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "logbook:sidebar-collapsed";

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    }
  }, [collapsed, isHydrated]);

  return {
    collapsed,
    setCollapsed,
    toggle: () => setCollapsed((previous) => !previous),
  };
}