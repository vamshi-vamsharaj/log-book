import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import * as taskService from "@/features/tasks/services/task.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const task = await taskService.cancelTask(user.id, id);

    return NextResponse.json(task);
  } catch (error) {
    return handleRouteError(error);
  }
}