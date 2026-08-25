import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { createCategorySchema } from "@/features/tasks/schemas/taxonomy.schema";
import * as taxonomyService from "@/features/tasks/services/taxonomy.service";

export async function GET() {
  try {
    const user = await requireApiUser();
    const categories = await taxonomyService.listCategories(user.id);

    return NextResponse.json(categories);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = createCategorySchema.parse(await request.json());
    const category = await taxonomyService.createCategory(user.id, body);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}