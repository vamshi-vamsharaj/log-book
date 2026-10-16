/** Timer repository — placeholder until the TimeEntry model is added to the schema. */

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number | null;
}

export async function findActiveEntryForTask(_taskId: string): Promise<TimeEntry | null> {
  return null;
}

export async function findActiveEntryForUser(_userId: string): Promise<TimeEntry | null> {
  return null;
}

export async function createTimeEntry(
  _taskId: string,
  _userId: string,
  _startedAt: Date,
): Promise<TimeEntry | null> {
  return null;
}

export async function closeTimeEntry(
  _entryId: string,
  _endedAt: Date,
  _durationSeconds: number,
): Promise<TimeEntry | null> {
  return null;
}

export async function findTimeEntriesForTask(_taskId: string): Promise<TimeEntry[]> {
  return [];
}