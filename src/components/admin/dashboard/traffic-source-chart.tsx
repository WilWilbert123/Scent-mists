"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/empty-state";

const COLORS = ["#B98792", "#E8C6CE", "#A6B1A0", "#8C7A72"];

interface TrafficSourceChartProps {
  data: { source: string; count: number; percentage: number }[];
}

export function TrafficSourceChart({ data }: TrafficSourceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic by Source</CardTitle>
        <CardDescription>
          Privacy-conscious referrer category distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="No Traffic Sources Recorded"
            description="Referrer categories (Direct, Organic Search, Social, Referral) will populate from real visitor sessions."
          />
        ) : (
          <div className="space-y-4">
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={3}
                  >
                    {data.map((entry, idx) => (
                      <Cell key={entry.source} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-elevated)",
                      borderColor: "var(--border)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="divide-y divide-border/70 border-t border-border pt-2 text-xs">
              {data.map((entry, idx) => (
                <li
                  key={entry.source}
                  className="flex items-center justify-between py-2"
                >
                  <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      aria-hidden="true"
                    />
                    <span>{entry.source}</span>
                  </span>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{entry.count}</strong>{" "}
                    {entry.count === 1 ? "view" : "views"} ({entry.percentage}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

