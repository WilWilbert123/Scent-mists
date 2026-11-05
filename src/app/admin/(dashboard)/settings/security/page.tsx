import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SecuritySettings } from "@/components/admin/settings/security-settings";
import { AdminAccountsManager } from "@/components/admin/settings/admin-accounts-manager";
import { getAdminAccountsListAction } from "@/actions/settings.actions";

export default async function AdminSecuritySettingsPage() {
  const { admins, currentAdminId } = await getAdminAccountsListAction();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Settings</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-foreground">
          Security &amp; Administrator Management
        </h1>
        <p className="text-xs text-muted-foreground">
          Update your administrator credentials, manage executive team accounts, and enforce password verification checks.
        </p>
      </div>

      <SecuritySettings />

      <AdminAccountsManager
        initialAdmins={admins}
        currentAdminId={currentAdminId}
      />
    </div>
  );
}

