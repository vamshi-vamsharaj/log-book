import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { createLabelSchema } from "@/features/tasks/schemas/taxonomy.schema";
import * as taxonomyService from "@/features/tasks/services/taxonomy.service";

export async function GET() {
  try {
    const user = await requireApiUser();
    const labels = await taxonomyService.listLabels(user.id);

    return NextResponse.json(labels);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = createLabelSchema.parse(await request.json());
    const label = await taxonomyService.createLabel(user.id, body);

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}