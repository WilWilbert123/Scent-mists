"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/shared/empty-state";

interface VisitorChartProps {
  data: { date: string; pageViews: number; uniqueVisitors: number }[];
}

export function VisitorChart({ data }: VisitorChartProps) {
  const activeDays = data.filter((d) => d.pageViews > 0);
  const totalViewsInSeries = data.reduce((sum, d) => sum + d.pageViews, 0);
  const peakDay =
    activeDays.length > 0
      ? activeDays.reduce((best, cur) =>
          cur.pageViews > best.pageViews ? cur : best
        )
      : null;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle>Visitor Overview</CardTitle>
          <CardDescription>
            Live Supabase anonymous unique visitors and page views over time
          </CardDescription>
        </div>
        {peakDay && (
          <div className="inline-flex items-center gap-3 border border-border bg-surface px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">
              Peak:{" "}
              <strong className="font-medium text-foreground">
                {peakDay.date} ({peakDay.pageViews} views)
              </strong>
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 || totalViewsInSeries === 0 ? (
          <EmptyState
            title="No Visitor Trend Data Yet"
            description="Visitor page views and unique sessions will appear here automatically once public pages are visited."
          />
        ) : (
          <div className="space-y-4">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B98792" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#B98792" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-elevated)",
                      borderColor: "var(--border)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    name="Page Views"
                    stroke="#B98792"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#B98792" }}
                    activeDot={{ r: 5 }}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="uniqueVisitors"
                    name="Unique Visitors"
                    stroke="#A6B1A0"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#A6B1A0" }}
                    activeDot={{ r: 5 }}
                    fillOpacity={0.18}
                    fill="#A6B1A0"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Active Dates Summary from Supabase */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <span>Recorded Activity by Date:</span>
              <div className="flex flex-wrap items-center gap-2">
                {activeDays.slice(-4).map((d) => (
                  <span
                    key={d.date}
                    className="border border-border bg-surface px-2.5 py-1 text-foreground"
                  >
                    <strong>{d.date}:</strong> {d.pageViews}{" "}
                    {d.pageViews === 1 ? "view" : "views"} • {d.uniqueVisitors}{" "}
                    {d.uniqueVisitors === 1 ? "visitor" : "visitors"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

