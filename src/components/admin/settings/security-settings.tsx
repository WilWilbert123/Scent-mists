"use client";

import React, { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { updateAdminPasswordAction } from "@/actions/settings.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function SecuritySettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateAdminPasswordAction({ newPassword });
      if (!res.success) {
        toast.error(res.error || "Unable to update password.");
        return;
      }
      toast.success("Administrator password updated securely.");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-border bg-surface-elevated p-6 sm:p-8 max-w-2xl"
    >
      <div className="border-b border-border pb-4 space-y-1">
        <h2 className="font-serif text-2xl text-foreground">
          Account Security &amp; Password
        </h2>
        <p className="text-xs text-muted-foreground">
          Update your Supabase Auth administrator password. Passwords are never
          logged in audit trails.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="sec-new-password"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            New Password (Minimum 8 characters)
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <>
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Show</span>
              </>
            )}
          </button>
        </div>
        <Input
          id="sec-new-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="sec-confirm-password"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Confirm New Password
        </label>
        <Input
          id="sec-confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isUpdating}>
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isUpdating ? "Updating..." : "Update Password"}</span>
        </Button>
      </div>
    </form>
  );
}

