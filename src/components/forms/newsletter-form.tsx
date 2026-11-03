"use client";

import React, { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { newsletterSubscriptionSchema } from "@/lib/validations";
import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface NewsletterValues {
  email: string;
  honeypot?: string;
}

export function NewsletterForm() {
  const formId = useId();
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSubscriptionSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      honeypot: "",
    },
  });

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/newsletter", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          connected?: boolean;
          activeCount?: number | null;
        };
        if (active) {
          if (typeof data.activeCount === "number") {
            setActiveCount(data.activeCount);
          }
          if (data.connected) {
            setIsRealtimeConnected(true);
          }
        }
      } catch {
        // Ignore network errors during initial status fetch
      }
    };

    void fetchStatus();

    if (!isSupabaseBrowserConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("public-newsletter-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "newsletter_subscribers",
        },
        () => {
          void fetchStatus();
        }
      )
      .subscribe((status) => {
        if (active && status === "SUBSCRIBED") {
          setIsRealtimeConnected(true);
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const onSubmit = async (values: NewsletterValues) => {
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as {
        success?: boolean;
        alreadySubscribed?: boolean;
        email?: string;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        toast.error(
          result.error || "Unable to subscribe right now. Please try again."
        );
        return;
      }

      const cleanEmail = result.email || values.email.trim().toLowerCase();
      setSubscribedEmail(cleanEmail);
      setAlreadyRegistered(Boolean(result.alreadySubscribed));
      if (!result.alreadySubscribed) {
        setActiveCount((prev) => (typeof prev === "number" ? prev + 1 : prev));
      }
      toast.success(
        result.message || "Welcome to the SCENTS & MISTS Private Letters."
      );
      reset();
    } catch {
      toast.error("Network error while subscribing. Please try again.");
    }
  };

  if (subscribedEmail) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-md border border-accent/50 bg-surface-elevated p-6 space-y-4 shadow-luxury"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-accent/40 bg-secondary/20 text-accent">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">
              {alreadyRegistered ? "Registry Confirmed" : "Subscription Active"}
            </p>
            <h3 className="font-serif text-xl text-foreground">
              Welcome to the House Journal
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Dispatches and seasonal unveilings will be sent to{" "}
              <span className="font-medium text-foreground">{subscribedEmail}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Saved to Supabase Registry</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setSubscribedEmail(null);
              setAlreadyRegistered(false);
            }}
            className="uppercase tracking-[0.16em] text-foreground hover:text-accent transition-colors"
          >
            Add Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      method="POST"
      action="/api/newsletter"
      noValidate
      className="w-full max-w-md border border-border/80 bg-surface-elevated p-6 sm:p-7 space-y-4 shadow-luxury"
    >
      {/* Hidden anti-spam honeypot input */}
      <div className="hidden" aria-hidden="true">
        <input
          id={`${formId}-hp`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-label="Honeypot"
          {...register("honeypot")}
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <label
          htmlFor={`${formId}-newsletter-email`}
          className="block text-[11px] uppercase tracking-[0.18em] text-foreground font-medium"
        >
          Email Address for Private Letters
        </label>
        {isRealtimeConnected && (
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {typeof activeCount === "number" && activeCount > 0
                ? `${activeCount} Joined`
                : "Live"}
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <Input
          id={`${formId}-newsletter-email`}
          type="email"
          autoComplete="email"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-newsletter-error` : undefined}
          placeholder="your.name@domain.com"
          className="flex-1 bg-background"
          {...register("email")}
        />
        <Button type="submit" disabled={isSubmitting} className="shrink-0">
          <span>{isSubmitting ? "Joining..." : "Subscribe"}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>

      {errors.email ? (
        <p
          id={`${formId}-newsletter-error`}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400 text-left"
        >
          {errors.email.message}
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <span className="h-1 w-1 rounded-full bg-accent shrink-0" aria-hidden="true" />
          <span>Seasonal dispatches only. Unsubscribe at any time.</span>
        </p>
      )}
    </form>
  );
}


