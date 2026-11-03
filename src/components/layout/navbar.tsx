"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PUBLIC_NAV_ITEMS } from "@/data/navigation";
import { BRAND_NAME } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";
import { MobileNavigation } from "./mobile-navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 transition-opacity hover:opacity-85"
        >
          <span className="relative h-9 w-9 shrink-0">
            <Image
              src="/images/logo/scentmistslogo.png"
              alt={`${BRAND_NAME} emblem`}
              fill
              priority
              sizes="36px"
              className="object-contain"
            />
          </span>
          <span className="font-serif text-xl sm:text-2xl tracking-[0.22em] text-foreground">
            {BRAND_NAME}
          </span>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "text-xs uppercase tracking-[0.18em] transition-colors py-2",
                      isActive
                        ? "text-accent font-medium border-b border-accent"
                        : "text-foreground/80 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Controls: Theme Toggle, Enquire CTA, Mobile Menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden sm:inline-flex min-h-[40px] items-center justify-center rounded-full bg-primary px-6 py-2 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Enquire
          </Link>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
