import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { createTaskSchema, listTasksQuerySchema } from "@/features/tasks/schemas/task.schema";
import * as taskService from "@/features/tasks/services/task.service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const query = listTasksQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const tasks = await taskService.listTasks(user.id, query);

    return NextResponse.json(tasks);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = createTaskSchema.parse(await request.json());
    const task = await taskService.createTask(user.id, body);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
