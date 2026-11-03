import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminProfileAndLogsAction } from "@/actions/settings.actions";
import { ProfileSettings } from "@/components/admin/settings/profile-settings";

export default async function AdminProfileSettingsPage() {
  const { admin } = await getAdminProfileAndLogsAction();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Settings</span>
        </Link>
      </div>

      <ProfileSettings admin={admin} />
    </div>
  );
}

