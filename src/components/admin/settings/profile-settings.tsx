"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { AdminProfile } from "@/types/admin";
import { updateAdminProfileAction } from "@/actions/settings.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

interface ProfileSettingsProps {
  admin: AdminProfile | null;
}

export function ProfileSettings({ admin }: ProfileSettingsProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(
    admin?.full_name || "House Administrator"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateAdminProfileAction({ full_name: fullName });
      if (!res.success) {
        toast.error(res.error || "Unable to update profile.");
        return;
      }
      toast.success("Administrator profile updated.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-border bg-surface-elevated p-6 sm:p-8 max-w-2xl"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            Administrator Profile
          </h2>
          <p className="text-xs text-muted-foreground">
            Verified role identity stored in public.admin_profiles
          </p>
        </div>
        <Badge variant="blossom">{admin?.role || "ADMIN"}</Badge>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="admin-prof-email"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Email Address
        </label>
        <Input
          id="admin-prof-email"
          value={admin?.email || "Not connected"}
          disabled
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="admin-prof-name"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Display Name
        </label>
        <Input
          id="admin-prof-name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSaving}>
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isSaving ? "Saving..." : "Save Profile"}</span>
        </Button>
      </div>
    </form>
  );
}

