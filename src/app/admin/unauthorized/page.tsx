import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUnauthorizedPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6 border border-border bg-surface-elevated p-8 sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-red-700/40 bg-red-950/10 text-red-600">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="eyebrow-label text-accent">403 • Access Restricted</p>
        <h1 className="font-serif text-3xl text-foreground">
          Unauthorized Account
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your session does not hold verified <code className="font-mono">ADMIN</code>{" "}
          privileges in <code className="font-mono">public.admin_profiles</code>.
          Public registration is disabled.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/admin/login">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>Admin Sign In</span>
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Public Website</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

