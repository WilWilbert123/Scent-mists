import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { FOOTER_NAV_GROUPS } from "@/data/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-serif text-2xl tracking-[0.22em] text-foreground"
            >
              <span className="relative h-9 w-9 shrink-0">
                <Image
                  src="/images/logo/scentmistslogo.png"
                  alt={`${BRAND_NAME} emblem`}
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </span>
              <span>{BRAND_NAME}</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Timeless Elegance. Lasting Impression. An atmospheric fragrance
              house dedicated to botanical stillness, delicate mountain
              blossoms, and architectural minimalism.
            </p>
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent hover:text-foreground transition-colors"
              >
                <span>Submit an Online Enquiry</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Fragrances Column */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="eyebrow-label text-foreground">Fragrance Showcase</h2>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAV_GROUPS.fragrances.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* House Navigation Column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="eyebrow-label text-foreground">The House</h2>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAV_GROUPS.house.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Editorial Notice */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="eyebrow-label text-foreground">Legal &amp; Privacy</h2>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAV_GROUPS.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2 text-xs text-muted-foreground/80 leading-relaxed">
              <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
                <span>Brand Showcase</span>
              </div>
              Curated presentation and client enquiry portfolio.
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>
            Copyright {currentYear} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/fragrance-guide" className="hover:text-foreground transition-colors">
              Olfactory Guide
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
