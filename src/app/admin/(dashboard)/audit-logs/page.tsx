import React from "react";
import { ShieldCheck } from "lucide-react";
import { getAdminProfileAndLogsAction } from "@/actions/settings.actions";
import { AuditLogTable } from "@/components/admin/audit/audit-log-table";

export default async function AdminAuditLogsPage() {
  const { auditLogs } = await getAdminProfileAndLogsAction();

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 text-accent mb-1">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span className="eyebrow-label">Security &amp; Compliance Trail</span>
        </div>
        <h1 className="font-serif text-3xl text-foreground">
          Administrative Audit Logs
        </h1>
        <p className="text-xs text-muted-foreground">
          Immutable log of administrative logins, product updates, content edits,
          and enquiry status changes. Passwords and tokens are never recorded.
        </p>
      </div>

      <AuditLogTable initialLogs={auditLogs} />
    </div>
  );
}

