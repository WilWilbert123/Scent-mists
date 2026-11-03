"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/data/navigation";
import { BRAND_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-primary-nav"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-border/80 p-2 text-foreground hover:bg-surface cursor-pointer"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-primary-nav"
          role="dialog"
          aria-label={`${BRAND_NAME} mobile menu`}
          className="fixed inset-x-0 top-[57px] z-50 border-b border-border bg-surface-elevated/98 backdrop-blur-md px-6 py-6 shadow-xl"
        >
          <nav aria-label="Mobile Primary">
            <ul className="flex flex-col space-y-2">
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between border-b border-border/40 py-3 text-base font-medium tracking-wide transition-colors",
                        isActive ? "text-accent font-semibold" : "text-foreground"
                      )}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 pt-2">
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-xs uppercase tracking-wider font-semibold text-primary-foreground transition-colors hover:bg-accent"
              >
                Browse All Perfumes
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

