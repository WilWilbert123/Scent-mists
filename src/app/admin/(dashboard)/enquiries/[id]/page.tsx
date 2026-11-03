import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEnquiryByIdAction } from "@/actions/enquiry.actions";
import { EnquiryDetails } from "@/components/admin/enquiries/enquiry-details";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { Button } from "@/components/ui/button";

interface AdminEnquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEnquiryDetailPage({
  params,
}: AdminEnquiryDetailPageProps) {
  const { id } = await params;
  const { enquiry } = await getEnquiryByIdAction(id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Enquiries</span>
        </Link>
      </div>

      {!enquiry ? (
        <EmptyState
          title="Enquiry Not Found"
          description="The requested enquiry record does not exist or could not be loaded."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/enquiries">Return to Enquiries List</Link>
            </Button>
          }
        />
      ) : (
        <EnquiryDetails enquiry={enquiry} />
      )}
    </div>
  );
}

