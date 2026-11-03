"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/types/enquiry";
import { updateEnquiryStatusAction } from "@/actions/enquiry.actions";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface EnquiryReplyFormProps {
  enquiry: Enquiry;
}

export function EnquiryReplyForm({ enquiry }: EnquiryReplyFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [internalNotes, setInternalNotes] = useState<string>(
    enquiry.internal_notes || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await updateEnquiryStatusAction({
        id: enquiry.id,
        status,
        internal_notes: internalNotes,
      });

      if (!result.success) {
        toast.error(result.error || "Unable to update enquiry.");
        return;
      }

      toast.success("Enquiry status and internal notes saved.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 border border-border bg-surface-elevated p-6"
    >
      <h3 className="font-serif text-xl text-foreground">
        Workflow Status &amp; Internal Concierge Notes
      </h3>

      <div className="space-y-2 max-w-xs">
        <label
          htmlFor="enquiry-status-select"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Enquiry Status
        </label>
        <Select
          id="enquiry-status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
          options={[
            { label: "NEW", value: "NEW" },
            { label: "PENDING", value: "PENDING" },
            { label: "CONTACTED", value: "CONTACTED" },
            { label: "RESOLVED", value: "RESOLVED" },
            { label: "ARCHIVED", value: "ARCHIVED" },
          ]}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="enquiry-internal-notes"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Internal Notes (Visible only to Administrators)
        </label>
        <Textarea
          id="enquiry-internal-notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Record consultation follow-ups, scent strips dispatched, or client preferences..."
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <a
          href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
            `Re: ${enquiry.subject} — SCENTS & MISTS Concierge`
          )}`}
          className="text-xs uppercase tracking-[0.16em] text-accent underline underline-offset-4 hover:text-foreground"
        >
          Compose Direct Email to {enquiry.full_name}
        </a>

        <Button type="submit" disabled={isSaving}>
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </form>
  );
}

