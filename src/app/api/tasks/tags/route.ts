import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { createTagSchema } from "@/features/tasks/schemas/taxonomy.schema";
import * as taxonomyService from "@/features/tasks/services/taxonomy.service";

export async function GET() {
  try {
    const user = await requireApiUser();
    const tags = await taxonomyService.listTags(user.id);

    return NextResponse.json(tags);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = createTagSchema.parse(await request.json());
    const tag = await taxonomyService.createTag(user.id, body);

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}