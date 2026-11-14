import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/errors";
import { requireApiUser } from "@/lib/session";
import * as expenseService from "@/features/expenses/services/expense.service";

export async function GET() {
  try {
    const user = await requireApiUser();
    const stats = await expenseService.getExpenseStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    return handleRouteError(error);
  }
}
