import React from "react";
import { getVisitorLogsAction } from "@/actions/analytics.actions";
import { VisitorTable } from "@/components/admin/visitors/visitor-table";

export default async function AdminVisitorsPage() {
  const { records } = await getVisitorLogsAction({ limit: 500 });

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-serif text-3xl text-foreground">
          Privacy-Conscious Visitor Log
        </h1>
        <p className="text-xs text-muted-foreground">
          Live Supabase telemetry stream of anonymous visitor identifiers, session identifiers, and public route views.
        </p>
      </div>

      <VisitorTable records={records} />
    </div>
  );
}

