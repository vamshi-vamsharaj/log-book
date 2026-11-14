import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import {
  createExpenseSchema,
  listExpensesQuerySchema,
} from "@/features/expenses/validations/expense.validation";
import * as expenseService from "@/features/expenses/services/expense.service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const query = listExpensesQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const expenses = await expenseService.listExpenses(user.id, query);
    return NextResponse.json(expenses);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const body = createExpenseSchema.parse(await request.json());
    const expense = await expenseService.createExpense(user.id, body);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
