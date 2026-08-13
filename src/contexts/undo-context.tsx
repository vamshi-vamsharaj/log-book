"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface UndoEntry {
  id: string;
  message: string;
  undo: () => void | Promise<void>;
}

interface UndoContextValue {
  registerUndo: (entry: UndoEntry) => void;
}

const UndoContext = createContext<UndoContextValue | null>(null);

const VISIBLE_MS = 6000;

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const [entry, setEntry] = useState<UndoEntry | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setEntry(null);
  }, []);

  const registerUndo = useCallback(
    (nextEntry: UndoEntry) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setEntry(nextEntry);
      timeoutRef.current = setTimeout(clear, VISIBLE_MS);
    },
    [clear],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        if (entry) {
          event.preventDefault();
          entry.undo();
          clear();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entry, clear]);

  return (
    <UndoContext.Provider value={{ registerUndo }}>
      {children}
      {entry ? (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-popover px-4 py-2.5 text-sm text-popover-foreground shadow-lg">
          <span>{entry.message}</span>
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => {
              entry.undo();
              clear();
            }}
          >
            Undo
          </button>
        </div>
      ) : null}
    </UndoContext.Provider>
  );
}

export function useUndo(): UndoContextValue {
  const context = useContext(UndoContext);

  if (!context) {
    throw new Error("useUndo must be used within an UndoProvider");
  }

  return context;
}