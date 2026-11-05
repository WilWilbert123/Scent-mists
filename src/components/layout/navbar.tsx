"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/data/navigation";
import { BRAND_NAME } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/context/cart-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NavbarProps {
  logoUrl?: string;
  brandName?: string;
}

export function Navbar({
  logoUrl: initialLogo = "/images/logo/scentmistslogo.png",
  brandName: initialBrand = BRAND_NAME,
}: NavbarProps) {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [logoUrl, setLogoUrl] = useState<string>(initialLogo);
  const [brandName, setBrandName] = useState<string>(initialBrand);

  useEffect(() => {
    setLogoUrl(initialLogo);
  }, [initialLogo]);

  useEffect(() => {
    setBrandName(initialBrand);
  }, [initialBrand]);

  // Real-time synchronization: listen for admin logo/brand identity updates
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("navbar-brand-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_content",
          filter: "content_key=eq.homepage",
        },
        (payload) => {
          const newRow = payload.new as { content_value?: Record<string, unknown> } | undefined;
          const val = newRow?.content_value;
          if (val && typeof val === "object") {
            if (typeof val.headerLogoUrl === "string" && val.headerLogoUrl.trim()) {
              setLogoUrl(val.headerLogoUrl);
            }
            if (typeof val.headerBrandName === "string" && val.headerBrandName.trim()) {
              setBrandName(val.headerBrandName);
            }
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Wordmark (Logo-only on mobile, Wordmark on sm+) */}
          <Link
            href="/"
            aria-label={brandName}
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
          >
            <span className="relative h-8 w-8 sm:h-8 sm:w-8 shrink-0">
              <Image
                src={logoUrl || "/images/logo/scentmistslogo.png"}
                alt={`${brandName} emblem`}
                fill
                priority
                sizes="32px"
                className="object-contain"
              />
            </span>
            <span className="hidden sm:inline font-serif text-lg sm:text-xl tracking-[0.18em] text-foreground font-medium">
              {brandName}
            </span>
          </Link>

          {/* Desktop Primary Navigation — Clean & Spaced */}
          <nav aria-label="Primary" className="hidden md:block">
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
                        "text-xs uppercase tracking-[0.16em] transition-colors py-1.5",
                        isActive
                          ? "text-accent font-semibold border-b border-accent"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Controls: Cart Button, Theme Toggle, Mobile Menu */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg text-foreground hover:bg-surface border border-border/80 transition-colors cursor-pointer"
              aria-label={`Open shopping cart with ${totalItems} items`}
            >
              <ShoppingBag className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground font-mono shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer />
    </>
  );
}
