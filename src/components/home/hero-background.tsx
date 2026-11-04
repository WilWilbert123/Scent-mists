import React from "react";
import Image from "next/image";

export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Light Mode Mobile: Full panoramic Himalayan peaks, blooming sakura, and stone ledge composed for portrait */}
      <Image
        src="/images/hero/himalayan-cherry-blossom-mobile-bg.webp"
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="sm:hidden object-cover object-top dark:hidden transform-gpu"
      />

      {/* Light Mode Desktop: Wide panoramic Himalayan snow peaks, morning mist, stone ledge & blooming sakura */}
      <Image
        src="/images/hero/himalayan-cherry-blossom-bg.webp"
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="hidden sm:block object-cover object-right-bottom dark:hidden transform-gpu"
      />

      {/* Dark Mode Mobile: Full portrait night atmosphere with glowing sakura, mist, and peaks */}
      <Image
        src="/images/hero/himalayan-cherry-blossom-dark-mobile-bg.webp"
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="hidden dark:block dark:sm:hidden object-cover object-top transform-gpu"
      />

      {/* Dark Mode Desktop: Deep espresso-charcoal atmosphere, smoky blush mist, dark stone ledge & glowing sakura */}
      <Image
        src="/images/hero/himalayan-cherry-blossom-dark-bg.webp"
        alt=""
        fill
        priority
        quality={92}
        sizes="100vw"
        className="hidden dark:hidden dark:sm:block object-cover object-right-bottom transform-gpu"
      />

      {/* Subtle readability veil: on desktop left-to-right behind text; on mobile bottom veil behind text */}
      <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-background/55 via-background/15 to-transparent dark:from-background/65 dark:via-background/20 dark:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 top-1/2 sm:hidden bg-gradient-to-b from-transparent via-background/40 to-background/90" />

      {/* Gentle bottom edge blend */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
}
