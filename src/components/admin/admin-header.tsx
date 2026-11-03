"use client";

import React from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface-elevated/95 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <AdminBreadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        <AdminSearch />
        <ThemeToggle className="min-h-[38px] min-w-[38px] p-2" />
        <AdminUserMenu email={adminEmail} fullName={adminName} />
      </div>
    </header>
  );
}

