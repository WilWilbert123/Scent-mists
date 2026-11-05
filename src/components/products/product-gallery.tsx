"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  name: string;
  primaryImage: string;
  gallery?: string[];
}

export function ProductGallery({
  name,
  primaryImage,
  gallery = [],
}: ProductGalleryProps) {
  const images = Array.from(new Set([primaryImage, ...gallery])).filter(Boolean);
  const [activeImage, setActiveImage] = useState(images[0] || "/images/products/himalayan-cherry-blossom.webp");

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="relative aspect-square sm:aspect-[4/5] max-w-[210px] sm:max-w-none mx-auto w-full overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
        <Image
          src={activeImage}
          alt={`${name} presentation view`}
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-2 sm:p-5"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex sm:grid sm:grid-cols-4 justify-center gap-1.5 sm:gap-3 overflow-x-auto pb-1" role="group" aria-label="Fragrance gallery views">
          {images.map((imgUrl, index) => {
            const isSelected = imgUrl === activeImage;
            return (
              <button
                key={`${imgUrl}-${index}`}
                type="button"
                onClick={() => setActiveImage(imgUrl)}
                aria-label={`View gallery image ${index + 1} for ${name}`}
                aria-pressed={isSelected}
                className={cn(
                  "relative h-12 w-12 sm:h-auto sm:w-auto sm:aspect-square shrink-0 overflow-hidden rounded-md border transition-all cursor-pointer",
                  isSelected
                    ? "border-accent ring-1 ring-accent"
                    : "border-border opacity-75 hover:opacity-100"
                )}
              >
                <Image
                  src={imgUrl}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

