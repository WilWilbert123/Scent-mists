"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in duration-150 ease-out will-change-[opacity]",
        className
      )}
    >
      {children}
    </div>
  );
}


