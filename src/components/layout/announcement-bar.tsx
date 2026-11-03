"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

interface AnnouncementBarProps {
  enabled?: boolean;
  text?: string;
  linkText?: string;
  linkHref?: string;
}

export function AnnouncementBar({
  enabled = true,
  text = "SCENTS & MISTS — Explore our high-altitude botanical Eau de Parfum showcase.",
  linkText = "Explore the Collection",
  linkHref = "/collections",
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed || !text) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Brand announcement"
      className="relative border-b border-border/70 bg-surface px-4 py-2.5 text-center text-xs text-foreground"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 pr-7">
        <p className="tracking-wide">
          {text}
          {linkText && linkHref && (
            <Link
              href={linkHref}
              className="ml-2 inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:text-accent"
            >
              <span>{linkText}</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

