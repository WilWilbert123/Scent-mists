"use client";

import React from "react";
import { Select } from "@/components/ui/select";

interface VisitorFiltersProps {
  deviceFilter: string;
  onDeviceChange: (device: string) => void;
  referrerFilter: string;
  onReferrerChange: (referrer: string) => void;
}

export function VisitorFilters({
  deviceFilter,
  onDeviceChange,
  referrerFilter,
  onReferrerChange,
}: VisitorFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-40">
        <Select
          aria-label="Filter by device category"
          value={deviceFilter}
          onChange={(e) => onDeviceChange(e.target.value)}
          options={[
            { label: "All Devices", value: "ALL" },
            { label: "Desktop", value: "Desktop" },
            { label: "Mobile", value: "Mobile" },
            { label: "Tablet", value: "Tablet" },
          ]}
          className="min-h-[40px] py-1.5 text-xs"
        />
      </div>

      <div className="w-44">
        <Select
          aria-label="Filter by referrer category"
          value={referrerFilter}
          onChange={(e) => onReferrerChange(e.target.value)}
          options={[
            { label: "All Traffic Sources", value: "ALL" },
            { label: "Direct", value: "Direct" },
            { label: "Organic Search", value: "Organic Search" },
            { label: "Social", value: "Social" },
            { label: "Referral", value: "Referral" },
          ]}
          className="min-h-[40px] py-1.5 text-xs"
        />
      </div>
    </div>
  );
}

