"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ShoppingBag } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/data/navigation";
import { BRAND_NAME } from "@/lib/constants";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

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
            {/* Drawer Hero Actions (Moved into Drawer for Clean Mobile View) */}
            <div className="mt-6 pt-4 border-t border-border/60 space-y-2.5">
              <Link
                href="/#catalog"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-xs uppercase tracking-wider font-semibold text-primary-foreground transition-colors hover:bg-accent shadow-sm"
              >
                <span>Explore Perfumes</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/80 bg-background/50 backdrop-blur-xs px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>View Cart ({totalItems})</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

