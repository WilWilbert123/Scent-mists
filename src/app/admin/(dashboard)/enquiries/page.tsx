import React from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { getAdminEnquiriesAction } from "@/actions/enquiry.actions";
import { EnquiryTable } from "@/components/admin/enquiries/enquiry-table";

export default async function AdminEnquiriesPage() {
  const { enquiries } = await getAdminEnquiriesAction();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">
            Customer Enquiries
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review, filter, add internal notes, and manage status workflows for
            client enquiries.
          </p>
        </div>

        <Link
          href="/admin/chat"
          className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-medium text-foreground hover:bg-accent/20 transition-all self-start sm:self-auto"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <MessageCircle className="h-4 w-4 text-accent" />
          <span>Switch to Live Customer Chat</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>

      <EnquiryTable initialEnquiries={enquiries} />
    </div>
  );
}

