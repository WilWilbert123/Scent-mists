import React from "react";
import type { EnquiryStatus } from "@/types/enquiry";
import { Badge } from "@/components/ui/badge";

interface EnquiryStatusBadgeProps {
  status: EnquiryStatus;
}

export function EnquiryStatusBadge({ status }: EnquiryStatusBadgeProps) {
  switch (status) {
    case "NEW":
      return <Badge variant="blossom">New</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "CONTACTED":
      return <Badge variant="sage">Contacted</Badge>;
    case "RESOLVED":
      return <Badge variant="success">Resolved</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

