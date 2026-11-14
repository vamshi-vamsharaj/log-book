import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import * as expenseService from "@/features/expenses/services/expense.service";

interface RouteParams {
  params: Promise<{ id: string; entryId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id, entryId } = await params;
    const updatedExpense = await expenseService.deleteExpenseEntry(user.id, id, entryId);
    return NextResponse.json(updatedExpense);
  } catch (error) {
    return handleRouteError(error);
  }
}
