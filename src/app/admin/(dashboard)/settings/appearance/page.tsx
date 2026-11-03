import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppearanceSettings } from "@/components/admin/settings/appearance-settings";

export default function AdminAppearanceSettingsPage() {
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

      <AppearanceSettings />
    </div>
  );
}

