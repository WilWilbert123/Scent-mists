import React from "react";
import Link from "next/link";
import { User, Shield, Palette, ArrowRight, Database } from "lucide-react";
import {
  getAdminProfileAndLogsAction,
  getSupabaseDatabaseDiagnosticsAction,
  getAdminAccountsListAction,
} from "@/actions/settings.actions";
import {
  getCartDeliverySettingsAction,
  getFlashSaleCampaignAction,
} from "@/actions/delivery-settings.actions";
import { formatDisplayDateTime } from "@/lib/format-date";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DatabaseStorageManager } from "@/components/admin/settings/database-storage-manager";
import { DeliveryAndPromoManager } from "@/components/admin/settings/delivery-and-promo-manager";
import { AdminAccountsManager } from "@/components/admin/settings/admin-accounts-manager";

export default async function AdminSettingsIndexPage() {
  const [
    { admin, auditLogs },
    diagnostics,
    cartDeliverySettings,
    flashSaleCampaign,
    adminAccounts,
  ] = await Promise.all([
    getAdminProfileAndLogsAction(),
    getSupabaseDatabaseDiagnosticsAction(),
    getCartDeliverySettingsAction(),
    getFlashSaleCampaignAction(),
    getAdminAccountsListAction(),
  ]);

  const sections = [
    {
      title: "Admin Profile",
      description:
        "View and update your administrator display name and role details in public.admin_profiles.",
      href: "/admin/settings/profile",
      icon: User,
      meta: admin
        ? `${admin.full_name} (${admin.email})`
        : "Connected to Supabase Auth",
    },
    {
      title: "Account Security & Team",
      description:
        "Update your administrator password and provision or manage executive team accounts.",
      href: "/admin/settings/security",
      icon: Shield,
      meta: `Role: ${admin?.role || "ADMIN"} • ${adminAccounts.admins.length} active administrators`,
    },
    {
      title: "Appearance & Theme",
      description:
        "Configure Light Mode (Warm Ivory default) or Dark Mode preferences.",
      href: "/admin/settings/appearance",
      icon: Palette,
      meta: "Synchronized across Admin & Showcase",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-serif text-3xl text-foreground">
          Administrator Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your profile, account security, and dashboard theme preferences.
        </p>
      </div>

      {/* Live Supabase Auth & Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Authenticated via Supabase Auth &amp;{" "}
            <code className="font-mono">public.admin_profiles</code>
            {admin ? ` • Account ID: ${admin.id}` : ""}
          </span>
        </div>
        {admin && (
          <div className="flex items-center gap-2">
            <Badge variant="success">{admin.role}</Badge>
            <span className="font-mono text-xs text-foreground">
              {admin.email}
            </span>
          </div>
        )}
      </div>

      {/* Live Admin Account KPI Cards */}
      {admin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Authenticated Email"
            value={admin.email}
            subtitle="Supabase Auth user"
          />
          <StatCard
            label="Display Name"
            value={admin.full_name}
            subtitle="Stored in public.admin_profiles"
          />
          <StatCard
            label="Access Role"
            value={admin.role}
            subtitle="Server-verified RBAC"
          />
          <StatCard
            label="Last Profile Sync"
            value={formatDisplayDateTime(admin.updated_at || admin.created_at)}
            subtitle={`${auditLogs.length} total audit trail events`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.href}
              href={sec.href}
              className="group flex flex-col justify-between border border-border bg-surface-elevated p-6 transition-colors hover:border-accent"
            >
              <div className="space-y-4">
                <div className="inline-flex h-10 w-10 items-center justify-center border border-accent/40 bg-surface text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl text-foreground">
                  {sec.title}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {sec.description}
                </p>
                <p className="border-t border-border/70 pt-3 font-mono text-[11px] text-foreground">
                  {sec.meta}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-accent">
                <span>Configure</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Administrator Accounts & Access Control (Add another admin with password check) */}
      <AdminAccountsManager
        initialAdmins={adminAccounts.admins}
        currentAdminId={adminAccounts.currentAdminId}
      />

      {/* Delivery Fee, Free Shipping & Scheduled Flash Sale Promo Engine */}
      <DeliveryAndPromoManager
        initialDeliverySettings={cartDeliverySettings}
        initialFlashSale={flashSaleCampaign}
      />

      {/* Live Supabase Tables & Storage Maintenance */}
      <DatabaseStorageManager initialDiagnostics={diagnostics} />
    </div>
  );
}

