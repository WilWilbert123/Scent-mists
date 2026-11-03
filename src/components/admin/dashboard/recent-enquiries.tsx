import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Enquiry } from "@/types/enquiry";
import { formatDisplayDate } from "@/lib/format-date";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EnquiryStatusBadge } from "@/components/admin/enquiries/enquiry-status-badge";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface RecentEnquiriesProps {
  enquiries: Enquiry[];
}

export function RecentEnquiries({ enquiries }: RecentEnquiriesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Enquiries</CardTitle>
          <CardDescription>
            Latest customer messages submitted through the showcase
          </CardDescription>
        </div>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-accent hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent>
        {enquiries.length === 0 ? (
          <EmptyState
            title="No Customer Enquiries Yet"
            description="Customer enquiries submitted on /contact or product pages will appear here automatically."
          />
        ) : (
          <Table ariaLabel="Recent customer enquiries">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.slice(0, 6).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/enquiries/${item.id}`}
                      className="hover:text-accent underline-offset-4 hover:underline"
                    >
                      {item.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.subject}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDisplayDate(item.created_at)}
                  </TableCell>
                  <TableCell>
                    <EnquiryStatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

