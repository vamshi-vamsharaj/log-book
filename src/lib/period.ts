export const PLANNING_LEVELS = ["YEAR", "SIX_MONTH", "QUARTER", "MONTH", "WEEK", "DAY"] as const;

export type PlanningLevel = (typeof PLANNING_LEVELS)[number];

const LEVEL_RANK: Record<PlanningLevel, number> = {
  YEAR: 0,
  SIX_MONTH: 1,
  QUARTER: 2,
  MONTH: 3,
  WEEK: 4,
  DAY: 5,
};

export const PLANNER_SLUG_TO_LEVEL: Record<string, PlanningLevel> = {
  day: "DAY",
  week: "WEEK",
  month: "MONTH",
  quarter: "QUARTER",
  "six-month": "SIX_MONTH",
  year: "YEAR",
};

export const LEVEL_TO_SLUG: Record<PlanningLevel, string> = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  SIX_MONTH: "six-month",
  YEAR: "year",
};

const LEVEL_LABELS: Record<PlanningLevel, string> = {
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  QUARTER: "Quarter",
  SIX_MONTH: "Six months",
  YEAR: "Year",
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MIN_YEAR = 1900;
const MAX_YEAR = 2200;
const DAY_MS = 86_400_000;

export type DateKey = string;

interface Ymd {
  y: number;
  m: number;
  d: number;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

function utcMs(y: number, m: number, d: number): number {
  return Date.UTC(y, m - 1, d);
}

function fromMs(ms: number): Ymd {
  const date = new Date(ms);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

function formatYmd({ y, m, d }: Ymd): DateKey {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

export function parseDateKey(key: string): Ymd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);

  if (!match) {
    return null;
  }

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  if (y < MIN_YEAR || y > MAX_YEAR) {
    return null;
  }

  const roundTrip = fromMs(utcMs(y, m, d));

  if (roundTrip.y !== y || roundTrip.m !== m || roundTrip.d !== d) {
    return null;
  }

  return { y, m, d };
}

export function isValidDateKey(key: string): boolean {
  return parseDateKey(key) !== null;
}

function requireYmd(key: DateKey): Ymd {
  const parsed = parseDateKey(key);

  if (!parsed) {
    throw new Error(`Invalid date key: ${key}`);
  }

  return parsed;
}

export function localDateKey(date: Date = new Date()): DateKey {
  return formatYmd({ y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() });
}

export function dateKeyToUtcDate(key: DateKey): Date {
  const { y, m, d } = requireYmd(key);
  return new Date(utcMs(y, m, d));
}

export function utcDateToDateKey(date: Date): DateKey {
  return formatYmd({ y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() });
}

export function addDays(key: DateKey, days: number): DateKey {
  const { y, m, d } = requireYmd(key);
  return formatYmd(fromMs(utcMs(y, m, d) + days * DAY_MS));
}

export function compareDateKeys(a: DateKey, b: DateKey): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function weekdayIndex(key: DateKey): number {
  const { y, m, d } = requireYmd(key);
  return (new Date(utcMs(y, m, d)).getUTCDay() + 6) % 7;
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function isoWeekOf(key: DateKey): { year: number; week: number } {
  const { y, m, d } = requireYmd(key);
  const dow = (new Date(utcMs(y, m, d)).getUTCDay() + 6) % 7;
  const thursdayMs = utcMs(y, m, d) + (3 - dow) * DAY_MS;
  const isoYear = new Date(thursdayMs).getUTCFullYear();
  const dayOfYear = Math.floor((thursdayMs - Date.UTC(isoYear, 0, 1)) / DAY_MS);
  return { year: isoYear, week: Math.floor(dayOfYear / 7) + 1 };
}

function isoWeeksInYear(year: number): number {
  return isoWeekOf(`${pad(year, 4)}-12-28`).week;
}

function isoWeekStart(year: number, week: number): DateKey {
  const jan4Ms = Date.UTC(year, 0, 4);
  const jan4Dow = (new Date(jan4Ms).getUTCDay() + 6) % 7;
  const mondayOfWeekOne = jan4Ms - jan4Dow * DAY_MS;
  return formatYmd(fromMs(mondayOfWeekOne + (week - 1) * 7 * DAY_MS));
}

export function periodKeyFor(level: PlanningLevel, dateKey: DateKey): string {
  const { y, m } = requireYmd(dateKey);

  switch (level) {
    case "DAY":
      return dateKey;
    case "WEEK": {
      const { year, week } = isoWeekOf(dateKey);
      return `${pad(year, 4)}-W${pad(week)}`;
    }
    case "MONTH":
      return `${pad(y, 4)}-${pad(m)}`;
    case "QUARTER":
      return `${pad(y, 4)}-Q${Math.floor((m - 1) / 3) + 1}`;
    case "SIX_MONTH":
      return `${pad(y, 4)}-H${m <= 6 ? 1 : 2}`;
    case "YEAR":
      return pad(y, 4);
  }
}

export function getPeriodRange(
  level: PlanningLevel,
  key: string,
): { start: DateKey; end: DateKey } | null {
  switch (level) {
    case "DAY": {
      return parseDateKey(key) ? { start: key, end: key } : null;
    }
    case "WEEK": {
      const match = /^(\d{4})-W(\d{2})$/.exec(key);

      if (!match) {
        return null;
      }

      const year = Number(match[1]);
      const week = Number(match[2]);

      if (year < MIN_YEAR || year > MAX_YEAR || week < 1 || week > isoWeeksInYear(year)) {
        return null;
      }

      const start = isoWeekStart(year, week);
      return { start, end: addDays(start, 6) };
    }
    case "MONTH": {
      const match = /^(\d{4})-(\d{2})$/.exec(key);

      if (!match) {
        return null;
      }

      const y = Number(match[1]);
      const m = Number(match[2]);

      if (y < MIN_YEAR || y > MAX_YEAR || m < 1 || m > 12) {
        return null;
      }

      return {
        start: formatYmd({ y, m, d: 1 }),
        end: formatYmd({ y, m, d: daysInMonth(y, m) }),
      };
    }
    case "QUARTER": {
      const match = /^(\d{4})-Q([1-4])$/.exec(key);

      if (!match) {
        return null;
      }

      const y = Number(match[1]);
      const q = Number(match[2]);

      if (y < MIN_YEAR || y > MAX_YEAR) {
        return null;
      }

      const startMonth = (q - 1) * 3 + 1;
      const endMonth = startMonth + 2;

      return {
        start: formatYmd({ y, m: startMonth, d: 1 }),
        end: formatYmd({ y, m: endMonth, d: daysInMonth(y, endMonth) }),
      };
    }
    case "SIX_MONTH": {
      const match = /^(\d{4})-H([12])$/.exec(key);

      if (!match) {
        return null;
      }

      const y = Number(match[1]);
      const h = Number(match[2]);

      if (y < MIN_YEAR || y > MAX_YEAR) {
        return null;
      }

      return h === 1
        ? { start: formatYmd({ y, m: 1, d: 1 }), end: formatYmd({ y, m: 6, d: 30 }) }
        : { start: formatYmd({ y, m: 7, d: 1 }), end: formatYmd({ y, m: 12, d: 31 }) };
    }
    case "YEAR": {
      const match = /^(\d{4})$/.exec(key);

      if (!match) {
        return null;
      }

      const y = Number(match[1]);

      if (y < MIN_YEAR || y > MAX_YEAR) {
        return null;
      }

      return { start: formatYmd({ y, m: 1, d: 1 }), end: formatYmd({ y, m: 12, d: 31 }) };
    }
  }
}

export function isValidPeriodKey(level: PlanningLevel, key: string): boolean {
  return getPeriodRange(level, key) !== null;
}

export function currentPeriodKey(level: PlanningLevel, today: DateKey): string {
  return periodKeyFor(level, today);
}

export function shiftPeriodKey(level: PlanningLevel, key: string, delta: number): string {
  const range = getPeriodRange(level, key);

  if (!range) {
    throw new Error(`Invalid ${level} period key: ${key}`);
  }

  const { y, m } = requireYmd(range.start);

  switch (level) {
    case "DAY":
      return addDays(key, delta);
    case "WEEK":
      return periodKeyFor("WEEK", addDays(range.start, delta * 7));
    case "MONTH": {
      const index = y * 12 + (m - 1) + delta;
      return `${pad(Math.floor(index / 12), 4)}-${pad((index % 12) + 1)}`;
    }
    case "QUARTER": {
      const index = y * 4 + Math.floor((m - 1) / 3) + delta;
      return `${pad(Math.floor(index / 4), 4)}-Q${(index % 4) + 1}`;
    }
    case "SIX_MONTH": {
      const index = y * 2 + (m <= 6 ? 0 : 1) + delta;
      return `${pad(Math.floor(index / 2), 4)}-H${(index % 2) + 1}`;
    }
    case "YEAR":
      return pad(y + delta, 4);
  }
}

export function isHigherLevel(a: PlanningLevel, b: PlanningLevel): boolean {
  return LEVEL_RANK[a] < LEVEL_RANK[b];
}

export function higherLevels(level: PlanningLevel): PlanningLevel[] {
  return PLANNING_LEVELS.filter((candidate) => isHigherLevel(candidate, level)).reverse();
}

export function lowerLevels(level: PlanningLevel): PlanningLevel[] {
  return PLANNING_LEVELS.filter((candidate) => isHigherLevel(level, candidate));
}

export function childLevel(level: PlanningLevel): PlanningLevel | null {
  return PLANNING_LEVELS[LEVEL_RANK[level] + 1] ?? null;
}

export function parentLevel(level: PlanningLevel): PlanningLevel | null {
  return PLANNING_LEVELS[LEVEL_RANK[level] - 1] ?? null;
}

export function periodsOverlap(
  levelA: PlanningLevel,
  keyA: string,
  levelB: PlanningLevel,
  keyB: string,
): boolean {
  const a = getPeriodRange(levelA, keyA);
  const b = getPeriodRange(levelB, keyB);

  if (!a || !b) {
    return false;
  }

  return a.start <= b.end && b.start <= a.end;
}

export function overlappingPeriodKeys(
  level: PlanningLevel,
  start: DateKey,
  end: DateKey,
): string[] {
  const keys: string[] = [];
  let cursor = periodKeyFor(level, start);
  const last = periodKeyFor(level, end);
  let guard = 0;

  while (guard < 5000) {
    keys.push(cursor);

    if (cursor === last) {
      break;
    }

    cursor = shiftPeriodKey(level, cursor, 1);
    guard += 1;
  }

  return keys;
}

export function childPeriodKeys(
  level: PlanningLevel,
  key: string,
): { level: PlanningLevel; keys: string[] } | null {
  const next = childLevel(level);
  const range = getPeriodRange(level, key);

  if (!next || !range) {
    return null;
  }

  return { level: next, keys: overlappingPeriodKeys(next, range.start, range.end) };
}

function monthDay(key: DateKey): string {
  const { m, d } = requireYmd(key);
  return `${MONTH_NAMES[m - 1]?.slice(0, 3) ?? ""} ${d}`;
}

export function formatPeriodLabel(level: PlanningLevel, key: string): string {
  const range = getPeriodRange(level, key);

  if (!range) {
    return key;
  }

  const start = requireYmd(range.start);
  const end = requireYmd(range.end);

  switch (level) {
    case "DAY":
      return `${WEEKDAY_NAMES[weekdayIndex(key)]?.slice(0, 3) ?? ""}, ${monthDay(key)}`;
    case "WEEK":
      return start.m === end.m
        ? `${monthDay(range.start)} – ${end.d}`
        : `${monthDay(range.start)} – ${monthDay(range.end)}`;
    case "MONTH":
      return `${MONTH_NAMES[start.m - 1] ?? ""} ${start.y}`;
    case "QUARTER":
      return `Q${Math.floor((start.m - 1) / 3) + 1} ${start.y}`;
    case "SIX_MONTH":
      return `${start.m === 1 ? "Jan – Jun" : "Jul – Dec"} ${start.y}`;
    case "YEAR":
      return `${start.y}`;
  }
}

export function formatPeriodTitle(level: PlanningLevel, key: string): string {
  const range = getPeriodRange(level, key);

  if (!range) {
    return key;
  }

  const start = requireYmd(range.start);

  switch (level) {
    case "DAY":
      return `${WEEKDAY_NAMES[weekdayIndex(key)] ?? ""}, ${MONTH_NAMES[start.m - 1] ?? ""} ${start.d}`;
    case "WEEK":
      return `Week ${Number(key.slice(6))}`;
    case "MONTH":
      return MONTH_NAMES[start.m - 1] ?? key;
    case "QUARTER":
      return `Quarter ${key.slice(6)}`;
    case "SIX_MONTH":
      return start.m === 1 ? "First half" : "Second half";
    case "YEAR":
      return `${start.y}`;
  }
}

export function formatPeriodEyebrow(level: PlanningLevel, key: string): string {
  const range = getPeriodRange(level, key);

  if (!range) {
    return LEVEL_LABELS[level];
  }

  const start = requireYmd(range.start);

  switch (level) {
    case "DAY":
      return `${start.y}`;
    case "WEEK":
      return `${key.slice(0, 4)} · ${formatPeriodLabel("WEEK", key)}`;
    case "MONTH":
      return `${start.y}`;
    case "QUARTER":
      return `${MONTH_NAMES[start.m - 1]?.slice(0, 3) ?? ""} – ${MONTH_NAMES[start.m + 1]?.slice(0, 3) ?? ""} ${start.y}`;
    case "SIX_MONTH":
      return formatPeriodLabel("SIX_MONTH", key);
    case "YEAR":
      return "Year plan";
  }
}

export function levelLabel(level: PlanningLevel): string {
  return LEVEL_LABELS[level];
}

export function levelFromSlug(slug: string): PlanningLevel | null {
  return PLANNER_SLUG_TO_LEVEL[slug] ?? null;
}
