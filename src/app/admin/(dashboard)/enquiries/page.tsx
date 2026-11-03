import React from "react";
import { getAdminEnquiriesAction } from "@/actions/enquiry.actions";
import { EnquiryTable } from "@/components/admin/enquiries/enquiry-table";

export default async function AdminEnquiriesPage() {
  const { enquiries } = await getAdminEnquiriesAction();

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-serif text-3xl text-foreground">
          Customer Enquiries
        </h1>
        <p className="text-xs text-muted-foreground">
          Review, filter, add internal notes, and manage status workflows for
          client enquiries.
        </p>
      </div>

      <EnquiryTable initialEnquiries={enquiries} />
    </div>
  );
}

