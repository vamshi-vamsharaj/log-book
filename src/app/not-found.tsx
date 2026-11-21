import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Layers className="h-6 w-6" />
      </div>
      <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
        404 — Page Not Found
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        This page seems to have wandered off
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The log or link you were looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
