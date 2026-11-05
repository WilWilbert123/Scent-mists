"use client";

import React, { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { enquirySubmissionSchema } from "@/lib/validations";
import type { EnquirySubmissionValues } from "@/types/enquiry";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface ContactFormProps {
  defaultSubject?: string;
}

interface SubmittedReceipt {
  referenceId: string;
  email: string;
  subject: string;
}

export function ContactForm({ defaultSubject = "" }: ContactFormProps) {
  const formId = useId();
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquirySubmissionValues>({
    resolver: zodResolver(enquirySubmissionSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      subject: defaultSubject,
      message: "",
      honeypot: "",
    },
  });

  useEffect(() => {
    if (isSupabaseBrowserConfigured()) {
      setIsLiveConnected(true);
    }
  }, []);

  const onSubmit = async (values: EnquirySubmissionValues) => {
    setServerError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as {
        success?: boolean;
        referenceId?: string;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        const msg =
          result.error ||
          "Unable to submit your enquiry at this moment. Please try again.";
        setServerError(msg);
        toast.error(msg);
        return;
      }

      setReceipt({
        referenceId: result.referenceId || "SM-DIRECT",
        email: values.email.trim().toLowerCase(),
        subject: values.subject.trim(),
      });
      toast.success(
        result.message ||
        "Thank you. Your enquiry has been received by our concierge."
      );
      reset();
    } catch {
      const fallbackMsg =
        "Network error while sending your enquiry. Please try again.";
      setServerError(fallbackMsg);
      toast.error(fallbackMsg);
    }
  };

  if (receipt) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-accent/50 bg-surface-elevated p-8 sm:p-10 space-y-6 shadow-luxury"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-4 text-[11px] uppercase tracking-[0.2em]">
          <span className="inline-flex items-center gap-2 text-accent font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Dispatched to Concierge</span>
          </span>
          <span className="font-mono text-muted-foreground">
            Ref: {receipt.referenceId}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-accent/40 bg-secondary/20 text-accent">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-foreground">
              Enquiry Recorded by SCENTS &amp; MISTS
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your enquiry regarding{" "}
              <strong className="font-medium text-foreground">
                {receipt.subject}
              </strong>{" "}
              has been saved directly to our concierge registry. Responses will
              be directed to{" "}
              <span className="text-foreground underline underline-offset-4">
                {receipt.email}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-border/60">
          <span className="text-xs text-muted-foreground">
            Status: <strong className="text-foreground">NEW • Queued for Review</strong>
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => setReceipt(null)}
          >
            Submit Another Enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      method="POST"
      action="/api/contact"
      noValidate
      className="rounded-xl sm:rounded-2xl border border-border/80 bg-surface-elevated shadow-luxury overflow-hidden"
    >
      {/* Top Status Bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-surface/60 px-3.5 py-2 sm:px-8 sm:py-3.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="font-medium text-foreground/85 flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3 text-accent" />
          <span>Direct Concierge Dispatch</span>
        </span>
        {isLiveConnected && (
          <span className="inline-flex items-center gap-1.5 text-foreground/80 font-mono text-[9px]">

          </span>
        )}
      </div>

      <div className="p-3 sm:p-8 space-y-2.5 sm:space-y-5">
        {/* Hidden anti-spam honeypot field */}
        <div className="hidden" aria-hidden="true">
          <input
            id={`${formId}-honeypot`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-label="Honeypot"
            {...register("honeypot")}
          />
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-800/40 bg-red-950/10 p-3 text-xs text-red-700 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor={`${formId}-full_name`}
              className="block text-[10px] sm:text-xs uppercase tracking-wider text-foreground font-medium"
            >
              Full Name <span className="text-accent">*</span>
            </label>
            <Input
              id={`${formId}-full_name`}
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.full_name)}
              aria-describedby={
                errors.full_name ? `${formId}-full_name-error` : undefined
              }
              placeholder="Your full name"
              className="bg-background min-h-[38px] sm:min-h-[44px] py-1.5 sm:py-2 text-xs px-3 rounded-lg"
              {...register("full_name")}
            />
            {errors.full_name && (
              <p
                id={`${formId}-full_name-error`}
                role="alert"
                className="text-[10px] text-red-600 dark:text-red-400"
              >
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor={`${formId}-email`}
              className="block text-[10px] sm:text-xs uppercase tracking-wider text-foreground font-medium"
            >
              Email Address <span className="text-accent">*</span>
            </label>
            <Input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? `${formId}-email-error` : undefined
              }
              placeholder="you@domain.com"
              className="bg-background min-h-[38px] sm:min-h-[44px] py-1.5 sm:py-2 text-xs px-3 rounded-lg"
              {...register("email")}
            />
            {errors.email && (
              <p
                id={`${formId}-email-error`}
                role="alert"
                className="text-[10px] text-red-600 dark:text-red-400"
              >
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor={`${formId}-subject`}
              className="block text-[10px] sm:text-xs uppercase tracking-wider text-foreground font-medium"
            >
              Subject <span className="text-accent">*</span>
            </label>
            <Input
              id={`${formId}-subject`}
              required
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? `${formId}-subject-error` : undefined
              }
              placeholder="Fragrance enquiry"
              className="bg-background min-h-[38px] sm:min-h-[44px] py-1.5 sm:py-2 text-xs px-3 rounded-lg"
              {...register("subject")}
            />
            {errors.subject && (
              <p
                id={`${formId}-subject-error`}
                role="alert"
                className="text-[10px] text-red-600 dark:text-red-400"
              >
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor={`${formId}-phone`}
              className="block text-[10px] sm:text-xs uppercase tracking-wider text-foreground font-medium"
            >
              Telephone (Optional)
            </label>
            <Input
              id={`${formId}-phone`}
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? `${formId}-phone-error` : undefined
              }
              placeholder="Phone number"
              className="bg-background min-h-[38px] sm:min-h-[44px] py-1.5 sm:py-2 text-xs px-3 rounded-lg"
              {...register("phone")}
            />
            {errors.phone && (
              <p
                id={`${formId}-phone-error`}
                role="alert"
                className="text-[10px] text-red-600 dark:text-red-400"
              >
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor={`${formId}-message`}
            className="block text-[10px] sm:text-xs uppercase tracking-wider text-foreground font-medium"
          >
            Your Enquiry <span className="text-accent">*</span>
          </label>
          <Textarea
            id={`${formId}-message`}
            required
            rows={3}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? `${formId}-message-error` : undefined
            }
            placeholder="Share your questions regarding fragrance notes, sillage, private consultations, or delivery..."
            className="bg-background min-h-[70px] sm:min-h-[110px] py-2 px-3 text-xs rounded-lg resize-none"
            {...register("message")}
          />
          {errors.message && (
            <p
              id={`${formId}-message-error`}
              role="alert"
              className="text-[10px] text-red-600 dark:text-red-400"
            >
              {errors.message.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 border-t border-border/60 pt-2.5 sm:pt-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left">
            Your details are handled confidentially in accordance with our{" "}
            <Link
              href="/privacy"
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[38px] sm:min-h-[42px] px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer shrink-0"
          >
            <span>{isSubmitting ? "Submitting Enquiry..." : "Submit Enquiry"}</span>
            <Send className="h-3 w-3 ml-1.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </form>
  );
}


