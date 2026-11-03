import React from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { QueryProvider } from "@/providers/query-provider";
import { CartProvider } from "@/context/cart-context";
import { AppToastProvider } from "@/components/ui/toast";
import { InitialLoader } from "@/components/layout/initial-loader";
import { constructMetadata } from "@/lib/metadata";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = constructMetadata();

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem("scents-mists-theme");
    var mode = saved === "dark" ? "dark" : "light";
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", mode);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider>
          <SupabaseProvider>
            <QueryProvider>
              <CartProvider>
                <InitialLoader />
                {children}
                <AppToastProvider />
              </CartProvider>
            </QueryProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
