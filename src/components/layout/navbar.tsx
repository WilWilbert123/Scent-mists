"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  MapPin,
  Compass,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/context/cart-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { DesktopMegaMenu, MEGA_MENU_ITEMS } from "./desktop-mega-menu";
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

  // Jo Malone-Style Hover Mega-Menu state with debounce buffer
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterTab = useCallback((menuId: string) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveMenu(menuId);
  }, []);

  const handleMouseLeaveNav = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  }, []);

  const handleCloseMenu = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveMenu(null);
  }, []);

  // Close mega menu on route change
  useEffect(() => {
    handleCloseMenu();
  }, [pathname, handleCloseMenu]);

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
      <header
        onMouseLeave={handleMouseLeaveNav}
        className="sticky top-0 z-50 w-full border-b border-border/70 bg-[#FAF7F2]/95 dark:bg-[#121212]/95 backdrop-blur-md transition-colors"
      >
        {/* =================================================================== */}
        {/* 1. MOBILE HEADER (Compact 56px, clean left logo & right cart/theme) */}
        {/* =================================================================== */}
        <div className="md:hidden flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            aria-label={brandName}
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
          >
            <span className="relative h-7 w-7 shrink-0">
              <Image
                src={logoUrl || "/images/logo/scentmistslogo.png"}
                alt={`${brandName} emblem`}
                fill
                priority
                sizes="28px"
                className="object-contain"
              />
            </span>
            <span className="font-serif text-lg tracking-[0.16em] text-foreground font-medium">
              {brandName}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg text-foreground hover:bg-surface/80 border border-border/80 transition-colors cursor-pointer"
              aria-label={`Open shopping cart with ${totalItems} items`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground font-mono shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>


        <div className="hidden md:block border-b border-border/50">
          <div className="w-full flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
            {/* Left Utilities (Search, GPS Delivery Pin, Scent Guide) — positioned near the left edge */}
            <div className="flex-1 flex items-center justify-start gap-1 sm:gap-2 text-muted-foreground">
              <Link
                href="/shop"
                className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors cursor-pointer"
                aria-label="Search perfumes"
                title="Search perfumes"
              >
                <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
              </Link>

              <Link
                href="/orders"
                className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors cursor-pointer"
                aria-label="Track and pin order"
                title="Pin & Track Orders"
              >
                <MapPin className="h-4 w-4 transition-transform group-hover:scale-110 text-accent/80" />
              </Link>

              <Link
                href="/fragrance-guide"
                className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors cursor-pointer"
                aria-label="Scent Guide"
                title="Fragrance Notes & Scent Guide"
              >
                <Compass className="h-4 w-4 transition-transform group-hover:scale-110 text-accent/80" />
              </Link>
            </div>

            {/* Centered Brand Emblem & Serif Identity (Exact Jo Malone Centered Styling) */}
            <div className="shrink-0 flex items-center justify-center px-4">
              <Link
                href="/"
                aria-label={brandName}
                className="group flex flex-col items-center justify-center text-center transition-opacity hover:opacity-90"
              >
                <span className="font-serif text-xl lg:text-2xl font-normal tracking-[0.24em] text-foreground uppercase leading-none">
                  {brandName}
                </span>
                <span className="font-mono text-[9px] tracking-[0.32em] text-muted-foreground/80 uppercase pt-1 font-medium">
                  Haute Parfumerie
                </span>
              </Link>
            </div>

            {/* Right Utilities (Concierge, Theme Toggle, Cart Drawer Button) — positioned near the right edge */}
            <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2.5">
              <Link
                href="/contact"
                className="group flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors cursor-pointer"
                aria-label="Concierge and inquiries"
                title="Private Concierge & Live Chat"
              >
                <MessageSquare className="h-4 w-4 transition-transform group-hover:scale-110" />
              </Link>

              <ThemeToggle className="h-9 w-9 min-h-[36px] min-w-[36px] rounded-full border-none hover:bg-surface/80 p-0 text-muted-foreground hover:text-foreground" />

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="group relative flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1.5 text-foreground hover:border-accent/60 hover:bg-surface transition-all cursor-pointer shadow-xs ml-0.5"
                aria-label={`Open shopping cart with ${totalItems} items`}
              >
                <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-mono text-xs font-semibold">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. DESKTOP JO MALONE CATEGORIES TIER (Auto-Hover Mega-Menu Triggers) */}
        {/* =================================================================== */}
        <nav aria-label="Primary Categories" className="hidden md:block">
          <div className="mx-auto flex h-11 max-w-[1400px] items-center justify-center px-6 lg:px-10 xl:px-12">
            <ul className="flex items-center gap-6 lg:gap-10">
              {MEGA_MENU_ITEMS.map((item) => {
                const isHovered = activeMenu === item.id;
                const isCurrentPath =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li
                    key={item.id}
                    onMouseEnter={() => handleMouseEnterTab(item.id)}
                    className="relative py-2.5"
                  >
                    <Link
                      href={item.href}
                      onClick={handleCloseMenu}
                      className={cn(
                        "text-xs lg:text-[12.5px] uppercase tracking-[0.18em] transition-colors font-medium select-none cursor-pointer",
                        isHovered || isCurrentPath
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground/90 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>

                    {/* Active Underline Indicator */}
                    <span
                      className={cn(
                        "absolute inset-x-0 bottom-0 h-[2px] transition-all duration-300",
                        isHovered
                          ? "bg-foreground scale-x-100"
                          : isCurrentPath
                            ? "bg-accent/60 scale-x-75"
                            : "bg-transparent scale-x-0"
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* =================================================================== */}
        {/* 4. FULL-WIDTH AUTO-HOVER MEGA-MENU DROPDOWN                        */}
        {/* =================================================================== */}
        <DesktopMegaMenu
          activeMenu={activeMenu}
          onClose={handleCloseMenu}
          onMouseEnter={handleMouseEnterTab}
        />
      </header>

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer />
    </>
  );
}
