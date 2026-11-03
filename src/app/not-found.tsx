import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[80dvh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg space-y-6 border border-border bg-surface-elevated p-10 sm:p-12">
        <p className="eyebrow-label text-accent">404 • Page Not Found</p>
        <h1 className="heading-section text-foreground">
          Lost in the Mountain Mist
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The page or fragrance archive you requested could not be located.
          Explore our curated collections or return to the main salon.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Return to Salon</span>
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/collections">
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Explore Collections</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

