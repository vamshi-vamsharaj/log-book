import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { updateLabelSchema } from "@/features/tasks/schemas/taxonomy.schema";
import * as taxonomyService from "@/features/tasks/services/taxonomy.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = updateLabelSchema.parse(await request.json());
    const label = await taxonomyService.updateLabel(user.id, id, body);

    return NextResponse.json(label);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await taxonomyService.deleteLabel(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}