import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import * as timerService from "@/features/tasks/services/timer.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const entry = await timerService.pauseTimer(user.id, id);

    return NextResponse.json(entry);
  } catch (error) {
    return handleRouteError(error);
  }
}