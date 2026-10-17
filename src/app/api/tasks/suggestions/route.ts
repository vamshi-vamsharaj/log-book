import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { suggestionsQuerySchema } from "@/features/tasks/schemas/task.schema";
import * as taskService from "@/features/tasks/services/task.service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const query = suggestionsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const suggestions = await taskService.getWeekSuggestions(user.id, query.date);

    return NextResponse.json(suggestions);
  } catch (error) {
    return handleRouteError(error);
  }
}
