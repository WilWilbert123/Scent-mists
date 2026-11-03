import React from "react";
import { getSiteContentOverviewAction } from "@/actions/content.actions";
import { ContentOverviewHub } from "@/components/admin/content/content-overview-hub";

export default async function AdminContentIndexPage() {
  const overview = await getSiteContentOverviewAction();

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-serif text-3xl text-foreground">
          Content Management System
        </h1>
        <p className="text-xs text-muted-foreground">
          Changes saved here reflect immediately on the public SCENTS &amp; MISTS
          website.
        </p>
      </div>

      <ContentOverviewHub overview={overview} />
    </div>
  );
}

