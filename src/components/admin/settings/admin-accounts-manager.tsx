"use client";

import React, { useState, useTransition } from "react";
import {
  UserPlus,
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  UserCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import type { AdminProfile } from "@/types/admin";
import {
  createAnotherAdminAction,
  deleteAdminAccountAction,
} from "@/actions/settings.actions";
import { formatDisplayDateTime } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

interface AdminAccountsManagerProps {
  initialAdmins: AdminProfile[];
  currentAdminId: string | null;
}

export function AdminAccountsManager({
  initialAdmins,
  currentAdminId,
}: AdminAccountsManagerProps) {
  const [admins, setAdmins] = useState<AdminProfile[]>(initialAdmins);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProfile | null>(null);
  const [deleteAuthPassword, setDeleteAuthPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");

  // Visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenAddModal = () => {
    setUsername("");
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentAdminPassword("");
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setFormError(null);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (username.trim().length < 2) {
      setFormError("Username must be at least 2 characters.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid administrator email address.");
      return;
    }

    if (newPassword.length < 8) {
      setFormError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("New password and Confirm Password do not match.");
      return;
    }

    if (!currentAdminPassword) {
      setFormError("You must enter your current admin password to authorize this action.");
      return;
    }

    startTransition(async () => {
      const res = await createAnotherAdminAction({
        username: username.trim(),
        email: email.trim(),
        newPassword,
        confirmPassword,
        currentAdminPassword,
      });

      if (!res.success) {
        setFormError(res.error || "Failed to create administrator account.");
        toast.error(res.error || "Failed to create administrator account.");
        return;
      }

      toast.success(
        `Administrator account for "${username}" created successfully!`
      );
      if (res.newAdmin) {
        setAdmins((prev) => [...prev, res.newAdmin!]);
      }
      handleCloseAddModal();
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteAuthPassword) {
      toast.error("Please enter your current admin password to authorize deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAdminAccountAction(
        deleteTarget.id,
        deleteAuthPassword
      );

      if (!res.success) {
        toast.error(res.error || "Failed to remove administrator account.");
        return;
      }

      toast.success(`Administrator "${deleteTarget.full_name}" has been removed.`);
      setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteAuthPassword("");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 border border-border bg-surface-elevated p-6 sm:p-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/10 border border-accent/20 text-accent">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <h2 className="font-serif text-2xl text-foreground">
              Administrator Accounts &amp; Access Control
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage executive administrators. Creating or removing admin accounts requires the active administrator&apos;s password for security authorization.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 h-9 px-4 text-xs bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Administrator</span>
        </Button>
      </div>

      {/* Administrators List */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          Active Administrators ({admins.length})
        </h3>

        <div className="divide-y divide-border rounded-xl border border-border bg-surface">
          {admins.map((admin) => {
            const isCurrent = admin.id === currentAdminId;
            const initials = admin.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "AD";

            return (
              <div
                key={admin.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-elevated/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 border border-accent/30 font-mono text-xs font-bold text-accent">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-foreground text-sm">
                        {admin.full_name}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-500">
                          <UserCheck className="h-2.5 w-2.5" />
                          You (Current Session)
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {admin.role}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground ml-13 sm:ml-0">
                  <span className="font-mono text-[11px]">
                    Added {formatDisplayDateTime(admin.created_at)}
                  </span>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(admin)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove Administrator"
                      aria-label={`Remove administrator ${admin.full_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-accent font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20 w-fit">
                  <UserPlus className="h-3 w-3" />
                  New Administrator Provisioning
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mt-1">
                  Add Administrator Account
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter the new administrator&apos;s details. You must provide your current admin password to authorize the account creation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAddModal}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Creation Form */}
            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              {/* Field 1: Username / Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-admin-username"
                  className="block text-[11px] font-mono uppercase tracking-wider text-foreground font-semibold"
                >
                  Username / Display Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="new-admin-username"
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins or admin_sarah"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-surface text-foreground"
                />
              </div>

              {/* Field 2: Admin Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-admin-email"
                  className="block text-[11px] font-mono uppercase tracking-wider text-foreground font-semibold"
                >
                  Admin Login Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="new-admin-email"
                  type="email"
                  required
                  placeholder="e.g. sarah@scentsandmists.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-surface text-foreground font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  This email will be used to log in at the executive admin portal.
                </p>
              </div>

              {/* Field 3: New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="new-admin-password"
                    className="block text-[11px] font-mono uppercase tracking-wider text-foreground font-semibold"
                  >
                    New Admin Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((p) => !p)}
                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPassword ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <Input
                  id="new-admin-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-surface text-foreground font-mono"
                />
              </div>

              {/* Field 4: Confirm Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="new-admin-confirm-password"
                    className="block text-[11px] font-mono uppercase tracking-wider text-foreground font-semibold"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <Input
                  id="new-admin-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-surface text-foreground font-mono"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-red-500 font-medium">
                    Passwords do not match.
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Field 5: CURRENT ADMIN PASSWORD (CRITICAL AUTHORIZATION STEP) */}
              <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-4 space-y-2 mt-2">
                <div className="flex items-center gap-2 text-amber-500 font-bold font-mono text-[11px] uppercase tracking-wide">
                  <Lock className="h-4 w-4" />
                  <span>Security Authorization Check</span>
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed">
                  Enter <strong>YOUR current administrator password</strong> to confirm authorization. If the password is wrong, the new account will not be created.
                </p>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="authorizing-admin-password"
                      className="block text-[10px] font-mono uppercase tracking-wider text-foreground font-semibold"
                    >
                      Your Current Admin Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((p) => !p)}
                      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Input
                    id="authorizing-admin-password"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="Enter your current password"
                    value={currentAdminPassword}
                    onChange={(e) => setCurrentAdminPassword(e.target.value)}
                    className="bg-surface border-amber-500/40 text-foreground font-mono focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseAddModal}
                  disabled={isPending}
                  className="h-9 px-4 text-xs bg-surface border-border hover:bg-surface-elevated text-foreground rounded-lg cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 h-9 px-4 text-xs bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying &amp; Creating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Authorize &amp; Create Account</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-surface-elevated p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="text-base font-serif font-bold text-foreground">
                Remove Administrator Access
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to revoke administrator access for{" "}
              <strong className="text-foreground">{deleteTarget.full_name}</strong> (
              <span className="font-mono text-accent">{deleteTarget.email}</span>)?
            </p>

            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="del-auth-password"
                className="block text-[11px] font-mono uppercase tracking-wider text-foreground font-semibold"
              >
                Enter Your Admin Password to Authorize Removal
              </label>
              <Input
                id="del-auth-password"
                type="password"
                placeholder="Your current password"
                value={deleteAuthPassword}
                onChange={(e) => setDeleteAuthPassword(e.target.value)}
                className="bg-surface font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteAuthPassword("");
                }}
                disabled={isDeleting}
                className="h-8 text-xs cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={!deleteAuthPassword || isDeleting}
                className="h-8 text-xs font-semibold cursor-pointer"
              >
                {isDeleting ? "Revoking..." : "Revoke Administrator Access"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
