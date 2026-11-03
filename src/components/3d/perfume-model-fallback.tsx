"use client";

import React from "react";
import Image from "next/image";

/**
 * Graceful luxury 2D/SVG fallback rendered if WebGL context creation is disabled
 * or blocked by the device/browser.
 */
export function PerfumeModelFallback() {
  return (
    <div className="relative flex h-[500px] sm:h-[560px] lg:h-[620px] w-full items-center justify-center overflow-hidden p-6">
      <div className="relative flex flex-col items-center text-center">
        <div className="relative h-80 w-64 sm:h-96 sm:w-72">
          <Image
            src="/images/products/himalayan-cherry-blossom.webp"
            alt="SCENTS & MISTS glass perfume flacon"
            fill
            sizes="(max-width: 768px) 260px, 320px"
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          SCENTS & MISTS — Eau de Parfum
        </p>
      </div>
    </div>
  );
}
