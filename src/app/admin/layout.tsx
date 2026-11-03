import React from "react";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Administration",
  description: "SCENTS & MISTS Administrator Portal",
  path: "/admin",
  noIndex: true,
});

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-shell min-h-dvh">{children}</div>;
}

