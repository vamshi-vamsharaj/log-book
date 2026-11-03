import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { createSubtaskSchema } from "@/features/tasks/validations/task.validation";
import * as taskService from "@/features/tasks/services/task.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = createSubtaskSchema.parse(await request.json());
    const subtask = await taskService.createSubtask(user.id, id, body.title);
    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
