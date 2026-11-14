import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { createExpenseEntrySchema } from "@/features/expenses/validations/expense.validation";
import * as expenseService from "@/features/expenses/services/expense.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = createExpenseEntrySchema.parse(await request.json());
    const updatedExpense = await expenseService.addExpenseEntry(user.id, id, body);
    return NextResponse.json(updatedExpense, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
