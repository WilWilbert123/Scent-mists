"use client";

import React from "react";
import { VisitorChart } from "@/components/admin/dashboard/visitor-chart";

interface PageViewChartProps {
  data: { date: string; pageViews: number; uniqueVisitors: number }[];
}

export function PageViewChart({ data }: PageViewChartProps) {
  return <VisitorChart data={data} />;
}

