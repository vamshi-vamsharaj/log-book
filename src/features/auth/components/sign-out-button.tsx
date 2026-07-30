"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    setIsSigningOut(false);
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}