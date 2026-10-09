import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { linkPreviewQuerySchema } from "@/features/tasks/validations/task.validation";
import { fetchLinkPreview } from "@/features/link-preview/services/fetch-preview";

export const runtime = "nodejs"; // needs node:dns for the SSRF guard — must not run on the edge runtime

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    const { url } = linkPreviewQuerySchema.parse({
      url: request.nextUrl.searchParams.get("url"),
    });
    const preview = await fetchLinkPreview(url);

    if (!preview) {
      return NextResponse.json({ url, title: null, description: null, siteName: null, image: null });
    }

    return NextResponse.json(preview);
  } catch (error) {
    return handleRouteError(error);
  }
}
