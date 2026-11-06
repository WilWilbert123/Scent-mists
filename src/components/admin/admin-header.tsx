"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAdminChatNotification } from "@/context/admin-chat-notification-context";
import { cn } from "@/lib/utils";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { AdminSearch } from "./admin-search";
import { AdminUserMenu } from "./admin-user-menu";
import { AdminMobileNav } from "./admin-mobile-nav";

interface AdminHeaderProps {
  adminEmail?: string;
  adminName?: string;
  isDatabaseConnected?: boolean;
}

export function AdminHeader({
  adminEmail,
  adminName,
}: AdminHeaderProps) {
  const { unreadCount } = useAdminChatNotification();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface-elevated/95 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <AdminBreadcrumbs />
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <AdminSearch />

        {/* Live Chat Top Header Indicator */}
        <Link
          href="/admin/chat"
          title={
            unreadCount > 0
              ? `${unreadCount} unread customer chat${unreadCount > 1 ? "s" : ""} - Open Live Chat`
              : "Open Live Customer Chat"
          }
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread customer messages`
              : "Live Customer Chat"
          }
          className={cn(
            "relative inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
            unreadCount > 0
              ? "border-rose-500/60 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:border-rose-400/60 dark:bg-rose-950/50 dark:text-rose-200"
              : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
          )}
        >
          <span className="relative inline-flex items-center">
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600"></span>
              </span>
            )}
          </span>
          <span className="hidden sm:inline font-sans font-medium">Live Chat</span>
          {unreadCount > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs font-mono animate-pulse dark:bg-rose-500">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <ThemeToggle className="min-h-[38px] min-w-[38px] p-2" />
        <AdminUserMenu email={adminEmail} fullName={adminName} />
      </div>
    </header>
  );
}


