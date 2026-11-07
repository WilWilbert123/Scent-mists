"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/data/admin-navigation";
import { BRAND_NAME } from "@/lib/constants";
import { signOutAdminAction } from "@/actions/auth.actions";
import { useAdminChatNotification } from "@/context/admin-chat-notification-context";
import { useAdminOrderNotification } from "@/context/admin-order-notification-context";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useAdminChatNotification();
  const { pendingOrdersCount } = useAdminOrderNotification();

  const handleLogout = async () => {
    setOpen(false);
    await signOutAdminAction();
    toast.success("Signed out of administrator session.");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? "Close admin menu" : "Open admin menu"}
        className="inline-flex h-10 w-10 items-center justify-center border border-border bg-surface text-foreground"
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Menu className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Mobile administrator navigation"
          className="fixed inset-x-0 top-16 z-50 border-b border-border bg-surface-elevated p-5 shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <span className="font-serif text-base tracking-[0.18em] text-foreground">
              {BRAND_NAME} ADMIN
            </span>
          </div>
          <nav aria-label="Mobile Admin">
            <ul className="grid grid-cols-2 gap-2">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between border px-3 py-2.5 text-xs font-medium transition-colors",
                        isActive
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{item.label}</span>
                      {item.href === "/admin/orders" && pendingOrdersCount > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white font-mono animate-pulse">
                          {pendingOrdersCount > 99 ? "99+" : pendingOrdersCount}
                        </span>
                      )}
                      {item.href === "/admin/chat" && unreadCount > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white font-mono animate-pulse">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 border border-border bg-surface py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-accent"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

