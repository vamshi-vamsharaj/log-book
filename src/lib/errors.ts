import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "INVALID_STATE_TRANSITION"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly status: number;
  readonly code: AppErrorCode;
  readonly fields?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code: AppErrorCode,
    fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have access to this resource"): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, "CONFLICT");
  }

  static invalidStateTransition(message: string): AppError {
    return new AppError(message, 422, "INVALID_STATE_TRANSITION");
  }
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, fields: error.fields } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "The provided data is invalid",
          fields: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}