import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { localDateKey } from "@/lib/period";
import * as taskService from "@/features/tasks/services/task.service";

const createUnscheduledSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  estimatedMinutes: z.number().int().min(1).max(1440).nullish(),
});

export async function GET() {
  try {
    const user = await requireApiUser();
    const tasks = await taskService.listUnscheduledTasks(user.id);
    return NextResponse.json(tasks);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = createUnscheduledSchema.parse(await request.json());
    const today = localDateKey();

    const task = await taskService.createTask(user.id, {
      title: body.title,
      level: "DAY",
      periodKey: today,
      scheduledDate: null,
      scheduledTime: null,
      estimatedMinutes: body.estimatedMinutes ?? null,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
