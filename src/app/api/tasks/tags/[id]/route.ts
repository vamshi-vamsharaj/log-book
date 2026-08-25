import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { updateTagSchema } from "@/features/tasks/schemas/taxonomy.schema";
import * as taxonomyService from "@/features/tasks/services/taxonomy.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = updateTagSchema.parse(await request.json());
    const tag = await taxonomyService.updateTag(user.id, id, body);

    return NextResponse.json(tag);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await taxonomyService.deleteTag(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}