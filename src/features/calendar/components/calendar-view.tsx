"use client";

import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Calendar, List } from "lucide-react";
import { useState, useMemo } from "react";

import { cn } from "@/lib/utils";
import { localDateKey, addDays, periodKeyFor, getPeriodRange } from "@/lib/period";
import { parseDateParts, getWeekDays, MONTH_NAMES } from "@/features/calendar/utils";
import { useCalendarTasks } from "@/features/calendar/hooks/use-calendar-tasks";
import { MonthView } from "@/features/calendar/components/month-view";
import { WeekView } from "@/features/calendar/components/week-view";
import { DayView } from "@/features/calendar/components/day-view";
import { AgendaView } from "@/features/calendar/components/agenda-view";
import { CalendarQuickAdd } from "@/features/calendar/components/calendar-quick-add";
import { TaskPeek } from "@/features/tasks/components/task-peek";
import type { CalendarTaskDTO } from "@/features/calendar/hooks/use-calendar-tasks";
import type { TaskDTO } from "@/features/tasks/hooks/use-planner-tasks";

type CalendarViewMode = "month" | "week" | "day" | "agenda";

const VIEW_ICONS = {
  month: Calendar,
  week: CalendarRange,
  day: CalendarDays,
  agenda: List,
};

const VIEW_LABELS: Record<CalendarViewMode, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
  agenda: "Agenda",
};

export function CalendarView() {
  const today = localDateKey();
  const [view, setView] = useState<CalendarViewMode>("week");
  const [currentDate, setCurrentDate] = useState(today); // anchor date for navigation

  // Task peek state
  const [peekTask, setPeekTask] = useState<TaskDTO | null>(null);
  // Quick-add dialog state
  const [addDate, setAddDate] = useState<string | null>(null);

  // Derive visible date range from current view
  const { startDate, endDate, label } = useMemo(() => {
    const { year, month } = parseDateParts(currentDate);
    switch (view) {
      case "month": {
        // Fetch the entire displayed grid (6 weeks)
        const firstDay = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
        // Start from up to 6 days before the 1st (Mon of first week)
        const gridStart = addDays(firstDay, -6);
        const gridEnd = addDays(firstDay, 41); // 6 weeks from 1st
        return {
          startDate: gridStart,
          endDate: gridEnd,
          label: `${MONTH_NAMES[month - 1]} ${year}`,
        };
      }
      case "week": {
        const days = getWeekDays(currentDate);
        const start = days[0]!;
        const end = days[6]!;
        const { day: startDay, month: startMonth, year: startYear } = parseDateParts(start);
        const { day: endDay, month: endMonth, year: endYear } = parseDateParts(end);
        const lbl =
          startMonth === endMonth
            ? `${MONTH_NAMES[startMonth - 1]} ${startDay}–${endDay}, ${startYear}`
            : `${MONTH_NAMES[startMonth - 1]?.slice(0, 3)} ${startDay} – ${MONTH_NAMES[endMonth - 1]?.slice(0, 3)} ${endDay}, ${endYear}`;
        return { startDate: start, endDate: end, label: lbl };
      }
      case "day": {
        const { day, month: m, year: y } = parseDateParts(currentDate);
        return {
          startDate: currentDate,
          endDate: currentDate,
          label: `${MONTH_NAMES[m - 1]} ${day}, ${y}`,
        };
      }
      case "agenda": {
        const end = addDays(currentDate, 29);
        const { month: m, year: y } = parseDateParts(currentDate);
        return {
          startDate: currentDate,
          endDate: end,
          label: `${MONTH_NAMES[m - 1]} ${y} – Next 30 days`,
        };
      }
    }
  }, [view, currentDate]);

  // Fetch tasks for the visible range (the API automatically includes carried-forward overdue tasks)
  const { data: tasks, isLoading, isError } = useCalendarTasks(startDate, endDate);

  function navigate(delta: number) {
    switch (view) {
      case "month": {
        const { year, month } = parseDateParts(currentDate);
        const newMonth = month - 1 + delta; // 0-indexed
        const wrappedYear = year + Math.floor(newMonth / 12);
        const wrappedMonth = ((newMonth % 12) + 12) % 12;
        const lastDay = new Date(Date.UTC(wrappedYear, wrappedMonth + 1, 0)).getUTCDate();
        const clampedDay = Math.min(parseDateParts(currentDate).day, lastDay);
        setCurrentDate(
          `${String(wrappedYear).padStart(4, "0")}-${String(wrappedMonth + 1).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`,
        );
        break;
      }
      case "week":
        setCurrentDate(addDays(currentDate, delta * 7));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, delta));
        break;
      case "agenda":
        setCurrentDate(addDays(currentDate, delta * 30));
        break;
    }
  }

  function goToToday() {
    setCurrentDate(today);
  }

  function handleTaskClick(task: CalendarTaskDTO) {
    setPeekTask(task as TaskDTO);
  }

  function handleDateClick(dateKey: string) {
    if (view === "month") {
      // On month view, clicking a date switches to day view for that date
      setCurrentDate(dateKey);
      setView("day");
    } else {
      // On week/day view, clicking opens quick-add
      setAddDate(dateKey);
    }
  }

  function handleAddTask(dateKey: string) {
    setAddDate(dateKey);
  }

  const safeWeekStart = getWeekDays(currentDate)[0] ?? currentDate;
  const { year, month } = parseDateParts(currentDate);

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        {/* Left: navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className={cn(
              "rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent",
              currentDate === today && "border-primary/60 bg-primary/10 text-primary",
            )}
          >
            Today
          </button>
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => navigate(1)}
              className="flex h-8 w-8 items-center justify-center border-l border-border transition-colors hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-sm font-semibold md:text-base">{label}</h2>
        </div>

        {/* Right: view switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {(["month", "week", "day", "agenda"] as CalendarViewMode[]).map((v) => {
            const Icon = VIEW_ICONS[v];
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{VIEW_LABELS[v]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading / error states ──────────────────────────────────── */}
      {isLoading && !tasks ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      ) : isError && !tasks ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-sm text-destructive">Failed to load calendar data. Try refreshing.</p>
        </div>
      ) : (
        /* ── Views ───────────────────────────────────────────────────── */
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {view === "month" && (
            <MonthView
              year={year}
              month={month}
              tasks={tasks ?? []}
              onTaskClick={handleTaskClick}
              onDateClick={handleDateClick}
            />
          )}
          {view === "week" && (
            <WeekView
              weekStartDate={safeWeekStart}
              tasks={tasks ?? []}
              onTaskClick={handleTaskClick}
              onDateClick={handleAddTask}
            />
          )}
          {view === "day" && (
            <DayView
              dateKey={currentDate}
              tasks={tasks ?? []}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              startDate={currentDate}
              tasks={tasks ?? []}
              onTaskClick={handleTaskClick}
              onDateClick={(dateKey) => {
                setCurrentDate(dateKey);
                setView("day");
              }}
            />
          )}
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      <CalendarQuickAdd dateKey={addDate} onClose={() => setAddDate(null)} />

      {peekTask ? (
        <TaskPeek
          task={peekTask}
          level={peekTask.level}
          periodKey={peekTask.periodKey}
          onClose={() => setPeekTask(null)}
        />
      ) : null}
    </div>
  );
}
