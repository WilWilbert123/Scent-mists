"use client";

import React, { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { signInAdminAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { toast } from "@/components/ui/toast";

export default function AdminLoginPage() {
  const formId = useId();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await signInAdminAction({ email, password });
      if (!result.success) {
        setErrorMessage(result.error || "Authentication failed.");
        toast.error(result.error || "Authentication failed.");
        return;
      }

      toast.success("Signed in to SCENTS & MISTS Administration.");
      router.push(result.redirectTo || "/admin");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-between bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Public Showcase</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto w-full max-w-md border border-border bg-surface-elevated p-8 sm:p-10 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="relative mx-auto h-14 w-14">
            <Image
              src="/images/logo/scentmistslogo.png"
              alt={`${BRAND_NAME} emblem`}
              fill
              priority
              sizes="56px"
              className="object-contain"
            />
          </div>
          <p className="eyebrow-label text-accent pt-1">Restricted Portal</p>
          <h1 className="font-serif text-3xl text-foreground">{BRAND_NAME}</h1>
          <p className="text-xs text-muted-foreground">
            Administrator Authentication • Verified Role Access Only
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 border border-red-800/40 bg-red-950/10 p-3.5 text-xs text-red-700 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}-email`}
              className="block text-xs uppercase tracking-[0.16em] text-foreground font-medium"
            >
              Administrator Email
            </label>
            <Input
              id={`${formId}-email`}
              type="email"
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@scentsandmists.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`${formId}-password`}
                className="block text-xs uppercase tracking-[0.16em] text-foreground font-medium"
              >
                Password
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
              id={`${formId}-password`}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isSubmitting ? "Verifying Session..." : "Sign In"}</span>
          </Button>
        </form>
      </div>

      <div aria-hidden="true" />
    </main>
  );
}

