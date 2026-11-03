"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  MessageSquare,
  Sparkles,
  Layers,
  FileText,
  Mail,
  ShieldCheck,
  Settings,
  LogOut,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { ADMIN_NAV_ITEMS, type AdminNavItem } from "@/data/admin-navigation";
import { BRAND_NAME } from "@/lib/constants";
import { signOutAdminAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const ICON_MAP: Record<AdminNavItem["iconName"], React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  Users,
  MessageSquare,
  Sparkles,
  Layers,
  FileText,
  Mail,
  ShieldCheck,
  Settings,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending indicator as soon as route pathname updates
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Eagerly prefetch all admin sidebar routes in the background after mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const item of ADMIN_NAV_ITEMS) {
        router.prefetch(item.href);
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [router]);

  const activeTarget = pendingHref ?? pathname;

  const handleLogout = async () => {
    await signOutAdminAction();
    toast.success("Signed out of administrator session.");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside
      aria-label="Administrator navigation"
      className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-surface-elevated text-foreground transition-colors duration-200 dark:bg-[#1B1918] dark:text-[#F5F0EB]"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-5 dark:border-white/10">
        <Link
          href="/admin"
          prefetch={true}
          onClick={() => {
            if (pathname !== "/admin") setPendingHref("/admin");
          }}
          className="inline-flex items-center gap-2.5 font-serif text-base tracking-[0.2em] text-foreground dark:text-[#F5F0EB]"
        >
          <span className="relative h-7 w-7 shrink-0">
            <Image
              src="/images/logo/scentmistslogo.png"
              alt={`${BRAND_NAME} emblem`}
              fill
              sizes="28px"
              className="object-contain"
            />
          </span>
          <span>{BRAND_NAME}</span>
        </Link>
        <span className="border border-accent/50 bg-secondary/35 px-2 py-0.5 text-[10px] uppercase tracking-widest text-foreground dark:border-[#B98792]/50 dark:bg-[#B98792]/20 dark:text-[#E8C6CE]">
          Admin
        </span>
      </div>

      {/* Navigation List */}
      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.iconName];
            const isCurrentRoute =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const isOptimisticActive =
              item.href === "/admin"
                ? activeTarget === "/admin"
                : activeTarget.startsWith(item.href);
            const isLoadingThisItem =
              pendingHref === item.href && !isCurrentRoute;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onClick={() => {
                    if (!isCurrentRoute) {
                      setPendingHref(item.href);
                    }
                  }}
                  aria-current={isOptimisticActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-medium tracking-wide transition-all duration-150",
                    isOptimisticActive
                      ? "border-l-2 border-accent bg-secondary/45 text-foreground shadow-xs dark:border-[#E8C6CE] dark:bg-[#5D3D43] dark:text-white"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground dark:text-[#A9A19B] dark:hover:bg-white/5 dark:hover:text-[#F5F0EB]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isOptimisticActive && "text-accent dark:text-[#E8C6CE]"
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </span>
                  {isLoadingThisItem && (
                    <Loader2
                      className="h-3.5 w-3.5 shrink-0 animate-spin text-accent dark:text-[#E8C6CE]"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Links */}
      <div className="border-t border-border p-4 space-y-2 dark:border-white/10">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:bg-surface hover:text-foreground transition-colors dark:text-[#A9A19B] dark:hover:bg-white/5 dark:hover:text-[#F5F0EB]"
        >
          <span>View Public Website</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-accent hover:bg-surface transition-colors dark:text-[#E8C6CE] dark:hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

