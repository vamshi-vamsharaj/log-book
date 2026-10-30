import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { isValidDateKey, localDateKey } from "@/lib/period";
import { db } from "@/lib/db";
import { TASK_SELECT } from "@/features/tasks/repositories/task.repository";

const querySchema = z.object({
  start: z.string().refine(isValidDateKey, "Invalid start date"),
  end: z.string().refine(isValidDateKey, "Invalid end date"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const { start, end } = querySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const today = localDateKey();

    // Fetch tasks that are:
    // 1. Scheduled within the requested range, OR
    // 2. Were scheduled before the range start (or even before today), are still
    //    incomplete and not skipped — these are "carried forward" tasks that should
    //    continue appearing until completed or skipped.
    const tasks = await db.task.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
        OR: [
          // Tasks directly scheduled in the visible range
          {
            scheduledDate: { gte: start, lte: end },
          },
          // Carried-forward tasks: incomplete, not skipped, scheduled before the range starts
          // but after the range's visible window cutoff (we show them on every day from their
          // scheduled date up to today).
          {
            scheduledDate: { lt: start },
            completed: false,
            skippedAt: null,
          },
        ],
      },
      select: TASK_SELECT,
      orderBy: [
        { scheduledTime: "asc" },
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    // Annotate tasks with carry-forward metadata
    const annotated = tasks.map((task) => ({
      ...task,
      isCarriedForward:
        task.scheduledDate !== null &&
        task.scheduledDate < today &&
        !task.completed &&
        !task.skippedAt,
      originalDate: task.scheduledDate ?? "",
    }));

    return NextResponse.json(annotated);
  } catch (error) {
    return handleRouteError(error);
  }
}
