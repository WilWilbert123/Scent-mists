"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { BannerItemConfig } from "@/types/admin";
import { cn } from "@/lib/utils";

interface ShopBannerCarouselProps {
  banners: BannerItemConfig[];
  autoSlideInterval?: number;
}

export function ShopBannerCarousel({
  banners,
  autoSlideInterval = 4500,
}: ShopBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeBanners = banners.filter((b) => b.isActive !== false);

  const nextSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Auto-slide effect
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused, nextSlide, autoSlideInterval]);

  // Touch Swipe Handlers (Smooth mobile navigation)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40; // minimum swipe distance
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (activeBanners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-sm border border-border/60 bg-surface-elevated select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Shop Promotional Banners"
    >
      {/* Aspect Ratio Container: Wide panoramic e-commerce proportion (long width, small height) */}
      <div className="relative w-full aspect-[22/8] sm:aspect-[24/7] md:aspect-[3.2/1] min-h-[120px] max-h-[190px] sm:max-h-[260px]">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          const imgUrl = banner.imageUrl || "/images/lifestyle/fragrance-collection.webp";

          return (
            <div
              key={banner.id || index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              )}
              aria-hidden={!isActive}
            >
              {/* Banner Background Image */}
              <Image
                src={imgUrl}
                alt={banner.title}
                fill
                priority={index === 0}
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                className="object-cover object-center"
              />

              {/* Luxury Vignette Gradient Overlay for Crisp Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10 dark:from-black/90 dark:via-black/55 dark:to-transparent" />

              {/* Banner Content Overlay */}
              <div className="relative z-20 flex h-full flex-col justify-center px-4 sm:px-8 max-w-xl space-y-1 sm:space-y-2">
                <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent bg-black/50 px-2 py-0.5 rounded-full w-fit backdrop-blur-xs border border-white/10">
                  Featured Showcase
                </span>

                <h3 className="font-serif text-xs sm:text-xl md:text-2xl font-bold text-white tracking-wide leading-tight drop-shadow-md">
                  {banner.title}
                </h3>

                {banner.subtitle && (
                  <p className="text-[10px] sm:text-xs text-white/90 line-clamp-1 sm:line-clamp-2 leading-relaxed drop-shadow-xs max-w-md font-sans">
                    {banner.subtitle}
                  </p>
                )}

                {banner.ctaHref && (
                  <div className="pt-0.5 sm:pt-1">
                    <Link
                      href={banner.ctaHref}
                      className="inline-flex items-center gap-1 rounded-md sm:rounded-lg bg-accent text-accent-foreground px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-transform active:scale-95 shadow-md"
                    >
                      <span>{banner.ctaText || "Shop Now"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Previous Button */}
        {activeBanners.length > 1 && (
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md hover:bg-black/60 transition-colors cursor-pointer border border-white/20 shadow-xs"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}

        {/* Next Button */}
        {activeBanners.length > 1 && (
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md hover:bg-black/60 transition-colors cursor-pointer border border-white/20 shadow-xs"
            aria-label="Next banner"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}

        {/* Bottom Pagination Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center items-center gap-1.5">
            {activeBanners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer shadow-xs",
                  dotIdx === currentIndex
                    ? "w-5 bg-accent"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                )}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

