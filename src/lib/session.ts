import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function currentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

/** For use in API route handlers – throws a 401 instead of redirecting. */
export async function requireApiUser() {
  const session = await getSession();

  if (!session?.user) {
    throw AppError.unauthorized("Not authenticated");
  }

  return session.user;
}