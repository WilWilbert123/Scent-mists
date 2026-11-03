import React from "react";
import Image from "next/image";

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Light Mode: Pastel blush-ivory Himalayan snow peaks, soft morning mist, stone ledge & blooming sakura */}
      <Image
        src="/images/hero/himalayan-cherry-blossom-bg.webp"
        alt=""
        fill
        priority
         quality={92}
        sizes="100vw"
        className="object-cover object-center sm:object-right-bottom dark:hidden transform-gpu"
      />

      {/* Dark Mode: Deep espresso-charcoal atmosphere, smoky blush mist, dark stone ledge & glowing sakura */}
      <Image
        src="/images/hero/himalayan-cherry-blossom-dark-bg.webp"
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="hidden object-cover object-center sm:object-right-bottom dark:block transform-gpu"
      />

      {/* Subtle left-side readability veil that preserves the mountain peaks, mist, stone ledge, and blossoms */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/15 to-transparent dark:from-background/65 dark:via-background/20 dark:to-transparent" />

      {/* Gentle bottom edge blend */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
}
