"use client";

import React from "react";
import { Select } from "@/components/ui/select";

interface EnquiryFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function EnquiryFilters({
  statusFilter,
  onStatusChange,
}: EnquiryFiltersProps) {
  return (
    <div className="w-44">
      <Select
        aria-label="Filter enquiries by status"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          { label: "All Statuses", value: "ALL" },
          { label: "New", value: "NEW" },
          { label: "Pending", value: "PENDING" },
          { label: "Contacted", value: "CONTACTED" },
          { label: "Resolved", value: "RESOLVED" },
          { label: "Archived", value: "ARCHIVED" },
        ]}
        className="min-h-[40px] py-1.5 text-xs"
      />
    </div>
  );
}

