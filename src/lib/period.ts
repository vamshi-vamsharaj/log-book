export type PlanningLevel = "YEAR" | "SIX_MONTH" | "QUARTER" | "MONTH" | "WEEK" | "DAY";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getWeekKey(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNumber =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${target.getUTCFullYear()}-W${pad(weekNumber)}`;
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function getQuarterKey(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${quarter}`;
}

export function getHalfYearKey(date: Date): string {
  const half = date.getMonth() < 6 ? 1 : 2;
  return `${date.getFullYear()}-H${half}`;
}

export function getYearKey(date: Date): string {
  return `${date.getFullYear()}`;
}

export function getPeriodKey(level: PlanningLevel, date: Date): string {
  switch (level) {
    case "DAY":
      return getDayKey(date);
    case "WEEK":
      return getWeekKey(date);
    case "MONTH":
      return getMonthKey(date);
    case "QUARTER":
      return getQuarterKey(date);
    case "SIX_MONTH":
      return getHalfYearKey(date);
    case "YEAR":
      return getYearKey(date);
  }
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getPeriodLabel(level: PlanningLevel, date: Date): string {
  switch (level) {
    case "DAY":
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    case "WEEK": {
      const start = startOfWeek(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    }
    case "MONTH":
      return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    case "QUARTER":
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case "SIX_MONTH":
      return `${date.getMonth() < 6 ? "Jan – Jun" : "Jul – Dec"} ${date.getFullYear()}`;
    case "YEAR":
      return `${date.getFullYear()}`;
  }
}

export function shiftPeriod(level: PlanningLevel, date: Date, direction: 1 | -1): Date {
  const result = new Date(date);
  switch (level) {
    case "DAY":
      result.setDate(result.getDate() + direction);
      break;
    case "WEEK":
      result.setDate(result.getDate() + direction * 7);
      break;
    case "MONTH":
      result.setMonth(result.getMonth() + direction);
      break;
    case "QUARTER":
      result.setMonth(result.getMonth() + direction * 3);
      break;
    case "SIX_MONTH":
      result.setMonth(result.getMonth() + direction * 6);
      break;
    case "YEAR":
      result.setFullYear(result.getFullYear() + direction);
      break;
  }
  return result;
}

export const PLANNER_SLUG_TO_LEVEL: Record<string, PlanningLevel> = {
  day: "DAY",
  week: "WEEK",
  month: "MONTH",
  quarter: "QUARTER",
  "six-month": "SIX_MONTH",
  year: "YEAR",
};