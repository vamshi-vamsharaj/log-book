import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { planningLevelSchema } from "@/features/tasks/validations/task.validation";
import { isValidPeriodKey } from "@/lib/period";
import { AppError } from "@/lib/errors";
import * as taskService from "@/features/tasks/services/task.service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const level = planningLevelSchema.parse(request.nextUrl.searchParams.get("level"));
    const periodKey = request.nextUrl.searchParams.get("periodKey") ?? "";

    if (!isValidPeriodKey(level, periodKey)) {
      throw new AppError("Invalid period", 400, "VALIDATION_ERROR");
    }

    const recommendations = await taskService.getRecommendations(user.id, level, periodKey);
    return NextResponse.json(recommendations);
  } catch (error) {
    return handleRouteError(error);
  }
}
