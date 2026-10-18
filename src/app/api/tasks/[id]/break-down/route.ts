import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { breakDownTaskSchema } from "@/features/tasks/validations/task.validation";
import * as taskService from "@/features/tasks/services/task.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = breakDownTaskSchema.parse(await request.json());
    const tasks = await taskService.breakDownTask(user.id, id, body);
    return NextResponse.json(tasks, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
