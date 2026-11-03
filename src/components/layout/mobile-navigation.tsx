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
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-primary-nav"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-border/80 p-2.5 text-foreground hover:bg-surface"
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
          className="fixed inset-x-0 top-[73px] z-50 border-b border-border bg-surface-elevated px-6 py-8 shadow-xl"
        >
          <nav aria-label="Mobile Primary">
            <ul className="flex flex-col space-y-4">
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
                        "flex items-center justify-between border-b border-border/50 py-3 font-serif text-xl tracking-wide transition-colors",
                        isActive ? "text-accent font-medium" : "text-foreground"
                      )}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 pt-2">
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="inline-flex w-full items-center justify-center bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Enquire With Our House
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

