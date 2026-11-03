"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Calendar, Trash2 } from "lucide-react";
import type { Enquiry } from "@/types/enquiry";
import { formatDisplayDateTime } from "@/lib/format-date";
import { deleteEnquiryAction } from "@/actions/enquiry.actions";
import { EnquiryStatusBadge } from "./enquiry-status-badge";
import { EnquiryReplyForm } from "./enquiry-reply-form";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface EnquiryDetailsProps {
  enquiry: Enquiry;
}

export function EnquiryDetails({ enquiry }: EnquiryDetailsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteEnquiryAction(enquiry.id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete enquiry.");
        return;
      }
      toast.success("Enquiry deleted.");
      router.push("/admin/enquiries");
      router.refresh();
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-border bg-surface-elevated p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <EnquiryStatusBadge status={enquiry.status} />
              <span className="text-xs text-muted-foreground">
                ID: {enquiry.id}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground">
              {enquiry.subject}
            </h2>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Delete Enquiry</span>
          </Button>
        </div>

        {/* Sender Metadata */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-b border-border pb-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Client Name
            </span>
            <p className="font-medium text-foreground">{enquiry.full_name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Email Address
            </span>
            <p className="text-foreground">{enquiry.email}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Telephone
            </span>
            <p className="text-foreground">{enquiry.phone || "Not provided"}</p>
          </div>
        </div>

        {/* Enquiry Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">Enquiry Message</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDisplayDateTime(enquiry.created_at)}
            </span>
          </div>
          <div className="border border-border/70 bg-surface p-5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {enquiry.message}
          </div>
        </div>
      </div>

      {/* Status & Internal Notes Editor */}
      <EnquiryReplyForm enquiry={enquiry} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Customer Enquiry"
        description={`Are you sure you want to permanently delete the enquiry from ${enquiry.full_name}? This action will be recorded in the administrative audit log.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

