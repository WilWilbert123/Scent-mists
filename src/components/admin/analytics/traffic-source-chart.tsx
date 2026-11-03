"use client";

import React from "react";
import { TrafficSourceChart as BaseTrafficSourceChart } from "@/components/admin/dashboard/traffic-source-chart";

interface TrafficSourceChartProps {
  data: { source: string; count: number; percentage: number }[];
}

export function TrafficSourceChart({ data }: TrafficSourceChartProps) {
  return <BaseTrafficSourceChart data={data} />;
}

