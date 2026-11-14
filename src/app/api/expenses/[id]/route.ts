import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import { updateExpenseSchema } from "@/features/expenses/validations/expense.validation";
import * as expenseService from "@/features/expenses/services/expense.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const expense = await expenseService.getExpense(user.id, id);
    return NextResponse.json(expense);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = updateExpenseSchema.parse(await request.json());
    const updated = await expenseService.updateExpense(user.id, id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const result = await expenseService.deleteExpense(user.id, id);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
