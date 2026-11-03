import React from "react";
import Image from "next/image";
import { BRAND_NAME } from "@/lib/constants";

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className="fixed inset-0 z-[9999] flex h-screen h-[100dvh] w-screen w-[100dvw] items-center justify-center bg-background select-none overflow-hidden m-0 p-0"
    >
      {/* Pure Minimalist Brand Logo */}
      <div className="relative h-28 w-28 sm:h-32 sm:w-32 animate-pulse duration-1000 flex items-center justify-center">
        <Image
          src="/images/logo/scentmistslogo.png"
          alt={BRAND_NAME}
          fill
          priority
          sizes="(max-width: 640px) 112px, 128px"
          className="object-contain drop-shadow-md"
        />
      </div>
    </div>
  );
}
