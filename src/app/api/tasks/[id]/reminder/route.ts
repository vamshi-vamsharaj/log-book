import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { updateReminderSchema } from "@/features/tasks/schemas/reminder.schema";
import * as reminderService from "@/features/tasks/services/reminder.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const reminder = await reminderService.getReminder(user.id, id);

    return NextResponse.json(reminder);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = updateReminderSchema.parse(await request.json());
    const reminder = await reminderService.setReminder(user.id, id, body);

    return NextResponse.json(reminder);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await reminderService.clearReminder(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}