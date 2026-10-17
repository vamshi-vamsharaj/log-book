import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { importTaskSchema } from "@/features/tasks/validations/task.validation";
import * as taskService from "@/features/tasks/services/task.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = importTaskSchema.parse(await request.json());
    const task = await taskService.importTask(user.id, body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
