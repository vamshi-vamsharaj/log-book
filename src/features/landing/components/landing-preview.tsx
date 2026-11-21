"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  HandCoins,
  Inbox,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Users,
  PanelRightClose,
  PanelRightOpen,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PreviewTab = "planner" | "calendar" | "expenses";

interface InteractiveTask {
  id: string;
  title: string;
  completed: boolean;
  time?: string;
  isCarriedForward?: boolean;
  carriedFrom?: string;
  tag?: string;
  subtasks?: { completed: number; total: number };
}

interface Borrower {
  id: string;
  name: string;
  totalLent: number;
  repaid: number;
  outstanding: number;
  status: "PENDING" | "PARTIALLY_REPAID" | "FULLY_REPAID";
  lastActionDate: string;
  transactionsCount: number;
}

export function LandingPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("planner");

  // Planner Tab interactive state
  const [tasks, setTasks] = useState<InteractiveTask[]>([
    {
      id: "1",
      title: "Deploy Vercel production build & verify database sync",
      completed: true,
      time: "09:30 AM",
      tag: "DevOps",
    },
    {
      id: "2",
      title: "Finalize Q4 strategy & quarterly goals review",
      completed: false,
      isCarriedForward: true,
      carriedFrom: "Monday",
      tag: "Strategy",
      subtasks: { completed: 2, total: 3 },
    },
    {
      id: "3",
      title: "Reconcile November lent transactions with Rahul & Priya",
      completed: false,
      time: "02:00 PM",
      tag: "Finance",
    },
    {
      id: "4",
      title: "Write design doc for unscheduled task holding area",
      completed: false,
      time: "04:30 PM",
      tag: "Product",
    },
  ]);

  const [newTaskInput, setNewTaskInput] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1440); // 24m 00s

  // Calendar Tab interactive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unscheduledTasks, setUnscheduledTasks] = useState([
    { id: "u1", title: "Audit session tokens & auth middleware", horizon: "Week" },
    { id: "u2", title: "Research Postgres connection pooling with Neon", horizon: "Month" },
    { id: "u3", title: "Update documentation for team onboarding", horizon: "Backlog" },
  ]);

  // Expense Tab interactive state
  const [borrowers, setBorrowers] = useState<Borrower[]>([
    {
      id: "b1",
      name: "Rahul Sharma",
      totalLent: 2000,
      repaid: 500,
      outstanding: 1500,
      status: "PARTIALLY_REPAID",
      lastActionDate: "Nov 5, 2026",
      transactionsCount: 2,
    },
    {
      id: "b2",
      name: "Priya Patel",
      totalLent: 15000,
      repaid: 15000,
      outstanding: 0,
      status: "FULLY_REPAID",
      lastActionDate: "Nov 12, 2026",
      transactionsCount: 1,
    },
    {
      id: "b3",
      name: "Ankit Verma",
      totalLent: 12000,
      repaid: 2000,
      outstanding: 10000,
      status: "PARTIALLY_REPAID",
      lastActionDate: "Nov 14, 2026",
      transactionsCount: 3,
    },
    {
      id: "b4",
      name: "Sameer Joshi",
      totalLent: 7000,
      repaid: 0,
      outstanding: 7000,
      status: "PENDING",
      lastActionDate: "Nov 16, 2026",
      transactionsCount: 1,
    },
  ]);

  const totalOutstanding = borrowers.reduce((acc, b) => acc + b.outstanding, 0);
  const totalRecovered = borrowers.reduce((acc, b) => acc + b.repaid, 0);
  const totalLent = borrowers.reduce((acc, b) => acc + b.totalLent, 0);
  const activeBorrowersCount = borrowers.filter((b) => b.outstanding > 0).length;

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: InteractiveTask = {
      id: Date.now().toString(),
      title: newTaskInput.trim(),
      completed: false,
      time: "Today",
      tag: "Focus",
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskInput("");
  }

  function scheduleUnscheduledTask(id: string) {
    const target = unscheduledTasks.find((u) => u.id === id);
    if (!target) return;
    setUnscheduledTasks((prev) => prev.filter((u) => u.id !== id));
    setTasks((prev) => [
      {
        id: Date.now().toString(),
        title: target.title,
        completed: false,
        time: "Scheduled for Today",
        tag: target.horizon,
      },
      ...prev,
    ]);
  }

  function recordQuickRepayment(borrowerId: string, amount: number) {
    setBorrowers((prev) =>
      prev.map((b) => {
        if (b.id !== borrowerId) return b;
        const newRepaid = b.repaid + amount;
        const newOutstanding = Math.max(0, b.totalLent - newRepaid);
        const status =
          newOutstanding === 0
            ? "FULLY_REPAID"
            : newRepaid > 0
              ? "PARTIALLY_REPAID"
              : "PENDING";
        return {
          ...b,
          repaid: newRepaid,
          outstanding: newOutstanding,
          status,
          lastActionDate: "Just now",
        };
      }),
    );
  }

  function addQuickLent(borrowerId: string, amount: number) {
    setBorrowers((prev) =>
      prev.map((b) => {
        if (b.id !== borrowerId) return b;
        const newTotal = b.totalLent + amount;
        const newOutstanding = newTotal - b.repaid;
        return {
          ...b,
          totalLent: newTotal,
          outstanding: newOutstanding,
          status: "PARTIALLY_REPAID",
          transactionsCount: b.transactionsCount + 1,
          lastActionDate: "Just now",
        };
      }),
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <section id="demo" className="scroll-mt-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold text-primary">
            Interactive Product Preview
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Experience the system in action.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Click checkboxes, schedule unscheduled backlog items, and simulate expense repayments.
            This is the actual workflow—built for zero friction.
          </p>
        </div>

        {/* Dashboard Shell Frame */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all">
          {/* Mac window header */}
          <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">app.logbook.internal/today</span>
            </div>

            {/* View Tabs */}
            <div className="flex rounded-lg border border-border/70 bg-background/80 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("planner")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
                  activeTab === "planner"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                Day Planner & Carry-Forward
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
                  activeTab === "calendar"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                Calendar & Holding Area
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("expenses")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
                  activeTab === "expenses"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <HandCoins className="h-3.5 w-3.5" />
                Expense & Lending Tracker
              </button>
            </div>
          </div>

          {/* Tab 1: Day Planner & Carry-Forward */}
          {activeTab === "planner" && (
            <div className="p-5 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Task List (2 cols) */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        Today&apos;s Execution Agenda
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {completedCount} of {tasks.length} tasks completed · Unfinished tasks carry forward automatically
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      Friday, Nov 20
                    </Badge>
                  </div>

                  {/* Quick-add form */}
                  <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a task for today... (Press Enter to test)"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                    />
                    <Button type="submit" size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </form>

                  {/* Task Items */}
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all",
                          task.completed
                            ? "border-border/40 bg-muted/20 opacity-75"
                            : "border-border/70 bg-card hover:border-primary/40 hover:shadow-xs",
                          task.isCarriedForward && !task.completed && "border-amber-500/40 bg-amber-500/[0.03]",
                        )}
                      >
                        {/* Interactive tactile Checkbox */}
                        <button
                          type="button"
                          aria-label={task.completed ? "Mark incomplete" : "Mark completed"}
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                            task.completed
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 hover:border-primary",
                          )}
                        >
                          {task.completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-medium transition-all",
                                task.completed
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground",
                              )}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                            {task.isCarriedForward && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                                <RotateCcw className="h-3 w-3" />
                                Carried forward from {task.carriedFrom}
                              </span>
                            )}
                            {task.time && (
                              <span className="text-muted-foreground">
                                🕒 {task.time}
                              </span>
                            )}
                            {task.subtasks && (
                              <span className="text-muted-foreground">
                                ✓ {task.subtasks.completed}/{task.subtasks.total} subtasks
                              </span>
                            )}
                            {task.tag && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                #{task.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Context Rail: Live Timer & Daily Horizon */}
                <div className="space-y-4">
                  {/* Focus Timer Widget */}
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Active Focus Timer
                      </span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
                        {Math.floor(timerSeconds / 60)}:00
                      </p>
                      <Button
                        size="sm"
                        variant={timerRunning ? "outline" : "default"}
                        onClick={() => {
                          setTimerRunning(!timerRunning);
                          if (!timerRunning) setTimerSeconds((s) => s + 60);
                        }}
                        className="gap-1.5"
                      >
                        {timerRunning ? (
                          <>
                            <Pause className="h-3.5 w-3.5" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" /> Start Focus
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Linked to: &ldquo;Finalize Q4 strategy & quarterly goals review&rdquo;
                    </p>
                  </div>

                  {/* Carry Forward Explanation Card */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Sparkles className="h-4 w-4" />
                      <h4 className="text-sm font-semibold">Zero-Loss Carry-Forward</h4>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      Incomplete tasks stay visible every day from their original date through today.
                      No duplicate entries, no manual rewriting, and clear visual tags.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Calendar & Unscheduled Sidebar */}
          {activeTab === "calendar" && (
            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row">
                {/* Month Grid preview (flex-1) */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        November 2026 Calendar
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Month overview with carry-forward status indicators
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="gap-1.5"
                    >
                      {isSidebarOpen ? (
                        <>
                          <PanelRightClose className="h-4 w-4" />
                          Hide Holding Area
                        </>
                      ) : (
                        <>
                          <PanelRightOpen className="h-4 w-4" />
                          Show Holding Area ({unscheduledTasks.length})
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Calendar Days Simulation */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span key={d} className="font-semibold text-muted-foreground py-1">
                        {d}
                      </span>
                    ))}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const day = i + 1;
                      const isToday = day === 20;
                      const hasCarry = day === 17;
                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex h-16 flex-col justify-between rounded-lg border p-1.5 text-left transition-all",
                            isToday
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border/60 bg-card hover:bg-accent/40",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              isToday ? "text-primary" : "text-muted-foreground",
                            )}
                          >
                            {day}
                          </span>
                          {isToday && (
                            <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary">
                              Today (4 tasks)
                            </span>
                          )}
                          {hasCarry && (
                            <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              Carry task
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Holding Area Sidebar */}
                {isSidebarOpen && (
                  <div className="w-full lg:w-80 rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Inbox className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Unscheduled Holding Area</h4>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {unscheduledTasks.length} in Inbox
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Temporary staging inbox for tasks without a set date. Click any task to instantly schedule it for Today.
                    </p>

                    <div className="space-y-2">
                      {unscheduledTasks.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                          All holding area tasks scheduled!
                        </div>
                      ) : (
                        unscheduledTasks.map((item) => (
                          <div
                            key={item.id}
                            className="group flex flex-col gap-2 rounded-lg border border-border/70 bg-card p-3 shadow-xs transition-all hover:border-primary/40"
                          >
                            <span className="text-xs font-medium text-foreground">{item.title}</span>
                            <div className="flex items-center justify-between">
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {item.horizon} horizon
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => scheduleUnscheduledTask(item.id)}
                                className="h-6 gap-1 px-2 text-[11px] text-primary hover:bg-primary/10"
                              >
                                Move to Today
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Expense & Lending Tracker */}
          {activeTab === "expenses" && (
            <div className="p-5 sm:p-7 space-y-6">
              {/* Stat Cards - Ordered per requested spec */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {/* Card 1: Outstanding (highlighted) */}
                <div className="flex flex-col justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Outstanding</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      ₹{totalOutstanding.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Remaining to be collected</p>
                  </div>
                </div>

                {/* Card 2: Recovered */}
                <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Recovered</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      ₹{totalRecovered.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">1 fully settled</p>
                  </div>
                </div>

                {/* Card 3: Total Lent */}
                <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Total Lent</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <HandCoins className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      ₹{totalLent.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">4 people on record</p>
                  </div>
                </div>

                {/* Card 4: Active Borrowers */}
                <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Active Borrowers</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {activeBorrowersCount}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">With pending balance</p>
                  </div>
                </div>
              </div>

              {/* People Ledger Simulation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">People & Repayments Ledger</h4>
                  <span className="text-xs text-muted-foreground">
                    Try clicking &ldquo;+ Repay ₹500&rdquo; to test real balance calculations
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {borrowers.map((person) => (
                    <div
                      key={person.id}
                      className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{person.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {person.transactionsCount} transaction{person.transactionsCount > 1 ? "s" : ""} · Last: {person.lastActionDate}
                          </p>
                        </div>
                        <Badge
                          variant={
                            person.status === "FULLY_REPAID"
                              ? "secondary"
                              : person.status === "PARTIALLY_REPAID"
                                ? "outline"
                                : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {person.status === "FULLY_REPAID"
                            ? "Fully Repaid"
                            : person.status === "PARTIALLY_REPAID"
                              ? "Partially Repaid"
                              : "Pending"}
                        </Badge>
                      </div>

                      {/* Amounts line */}
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-xs">
                        <div>
                          <span className="text-muted-foreground">Lent: </span>
                          <span className="font-medium">₹{person.totalLent.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Repaid: </span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            ₹{person.repaid.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Due: </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            ₹{person.outstanding.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Actions */}
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={person.outstanding === 0}
                          onClick={() => recordQuickRepayment(person.id, 500)}
                          className="h-7 text-xs flex-1"
                        >
                          + Repay ₹500
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addQuickLent(person.id, 500)}
                          className="h-7 text-xs flex-1"
                        >
                          + Lend ₹500
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
