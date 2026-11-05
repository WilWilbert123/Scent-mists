"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND_NAME } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface FooterProps {
  logoUrl?: string;
  brandName?: string;
  description?: string;
}

export function Footer({
  logoUrl: initialLogo = "/images/logo/scentmistslogo.png",
  brandName: initialBrand = BRAND_NAME,
  description: initialDesc = "Authentic 50ml Aroma Body Mists and 85ml Victoria's Secret Perfumes. Pin your location for accurate door-to-door delivery.",
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [logoUrl, setLogoUrl] = useState<string>(initialLogo);
  const [brandName, setBrandName] = useState<string>(initialBrand);
  const [description, setDescription] = useState<string>(initialDesc);

  useEffect(() => {
    setLogoUrl(initialLogo);
  }, [initialLogo]);

  useEffect(() => {
    setBrandName(initialBrand);
  }, [initialBrand]);

  useEffect(() => {
    setDescription(initialDesc);
  }, [initialDesc]);

  // Real-time synchronization: listen for admin logo/brand identity updates
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("footer-brand-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_content",
          filter: "content_key=eq.homepage",
        },
        (payload) => {
          const newRow = payload.new as { content_value?: Record<string, unknown> } | undefined;
          const val = newRow?.content_value;
          if (val && typeof val === "object") {
            const logo = (val.footerLogoUrl as string) || (val.headerLogoUrl as string);
            if (logo && logo.trim()) setLogoUrl(logo);
            if (typeof val.headerBrandName === "string" && val.headerBrandName.trim()) {
              setBrandName(val.headerBrandName);
            }
            if (typeof val.footerDescription === "string" && val.footerDescription.trim()) {
              setDescription(val.footerDescription);
            }
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <footer className="hidden md:block border-t border-border bg-surface text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-serif text-xl tracking-[0.16em] text-foreground"
            >
              <span className="relative h-7 w-7 shrink-0">
                <Image
                  src={logoUrl || "/images/logo/scentmistslogo.png"}
                  alt={`${brandName} emblem`}
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </span>
              <span>{brandName}</span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Perfumes &amp; Mists
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  Aroma Body Mists (50ml)
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  VS Perfumes (85ml)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Service & Delivery */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Delivery &amp; Payment
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We offer Cash on Delivery (COD) and GCash payments. Pin your exact location on our map during checkout for accurate delivery.
            </p>
            <div className="pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-lg bg-primary px-3.5 py-2 text-[11px] font-medium uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {currentYear} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
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

