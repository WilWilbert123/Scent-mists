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
    <div className="space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-surface">
        <Image
          src={activeImage}
          alt={`${name} presentation view`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3" role="group" aria-label="Fragrance gallery views">
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
                  "relative aspect-square overflow-hidden border transition-all",
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

