/** Status transition helpers — placeholder until task status enum is added to the schema. */

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED" | "ARCHIVED";

export function assertValidTransition(_from: TaskStatus, _to: TaskStatus): void {
  // Stub — enforce valid state machine transitions here once statuses are persisted.
}

export function isActiveStatus(_status: TaskStatus): boolean {
  return false;
}