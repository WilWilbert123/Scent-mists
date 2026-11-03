"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-xs text-muted-foreground">
      <ol className="flex items-center gap-1.5">
        {segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;
          const label = seg.replace(/-/g, " ");

          return (
            <li key={href} className="flex items-center gap-1.5">
              {idx > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="capitalize font-medium text-foreground">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="capitalize hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

