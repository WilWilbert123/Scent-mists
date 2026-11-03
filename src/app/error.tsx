"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[75dvh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6 border border-border bg-surface-elevated p-8 sm:p-10">
        <p className="eyebrow-label text-accent">Unexpected Interruption</p>
        <h1 className="heading-section text-foreground">
          A Momentary Stillness
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We encountered an unexpected issue while preparing this view. Please
          refresh or return to the SCENTS &amp; MISTS salon.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button type="button" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Return Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

