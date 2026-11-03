import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { updateSubtaskSchema } from "@/features/tasks/schemas/subtask.schema";
import * as subtaskService from "@/features/tasks/services/subtask.service";

interface RouteParams {
  params: Promise<{ id: string; subtaskId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id, subtaskId } = await params;
    const body = updateSubtaskSchema.parse(await request.json());
    const subtask = await subtaskService.updateSubtask(user.id, id, subtaskId, body);

    return NextResponse.json(subtask);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id, subtaskId } = await params;
    await subtaskService.deleteSubtask(user.id, id, subtaskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}