"use client";

import React from "react";
import Image from "next/image";
import { BRAND_NAME } from "@/lib/constants";

export function PerfumeModelLoader() {
  return (
    <div
      role="status"
      aria-label="Loading 3D perfume bottle showcase"
      className="relative flex h-[500px] sm:h-[560px] lg:h-[620px] w-full flex-col items-center justify-center overflow-hidden p-6"
    >
      <div className="relative h-24 w-24 animate-pulse">
        <Image
          src="/images/logo/scentmistslogo.png"
          alt={BRAND_NAME}
          fill
          priority
          sizes="96px"
          className="object-contain"
        />
      </div>
      <span className="mt-4 eyebrow-label text-muted-foreground">
        Preparing 3D Flacon Showcase
      </span>
    </div>
  );
}
