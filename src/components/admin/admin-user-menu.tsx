"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, Shield, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAdminAction } from "@/actions/auth.actions";
import { toast } from "@/components/ui/toast";

interface AdminUserMenuProps {
  email?: string;
  fullName?: string;
}

export function AdminUserMenu({
  email = "",
  fullName = "Administrator",
}: AdminUserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAdminAction();
    toast.success("Signed out of administrator session.");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Administrator profile menu"
          className="inline-flex items-center gap-2.5 border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:border-accent transition-colors"
        >
          <User className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span className="hidden sm:inline font-medium">{fullName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 border-b border-border/60">
          <p className="text-xs font-medium text-foreground">{fullName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/settings/profile"
            className="flex w-full items-center gap-2.5 cursor-pointer py-2 text-xs"
          >
            <User className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
            <span>Admin Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/settings/security"
            className="flex w-full items-center gap-2.5 cursor-pointer py-2 text-xs"
          >
            <Shield className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
            <span>Security &amp; Password</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/settings/appearance"
            className="flex w-full items-center gap-2.5 cursor-pointer py-2 text-xs"
          >
            <Settings className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
            <span>Dashboard Appearance</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="flex w-full items-center gap-2.5 cursor-pointer py-2 text-xs text-red-600 focus:bg-red-500/10 focus:text-red-600 dark:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

