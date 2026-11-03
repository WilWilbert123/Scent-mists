"use client";

import { useVisitorAnalytics } from "@/hooks/use-analytics";

export function VisitorTracker() {
  useVisitorAnalytics();
  return null;
}

