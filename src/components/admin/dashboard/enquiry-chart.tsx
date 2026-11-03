"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface EnquiryChartProps {
  data: { date: string; count: number }[];
}

export function EnquiryChart({ data }: EnquiryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enquiry Volume Trend</CardTitle>
        <CardDescription>
          Customer enquiries received per day from the public contact form
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="No Enquiries in Selected Range"
            description="When visitors submit fragrance enquiries, daily volumes will be charted here."
          />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Enquiries" fill="#B98792" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

