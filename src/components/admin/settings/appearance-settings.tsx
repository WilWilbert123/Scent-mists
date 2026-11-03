"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 border border-border bg-surface-elevated p-6 sm:p-8 max-w-2xl">
      <div className="border-b border-border pb-4 space-y-1">
        <h2 className="font-serif text-2xl text-foreground">
          Theme &amp; Dashboard Appearance
        </h2>
        <p className="text-xs text-muted-foreground">
          Select your preferred color scheme. Light mode (Warm Ivory) is the
          house default.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.14em] text-foreground font-medium">
          Color Scheme Preference
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
            className={cn(
              "flex flex-col items-start gap-3 border p-5 text-left transition-all",
              theme === "light"
                ? "border-accent ring-1 ring-accent bg-surface"
                : "border-border bg-surface/40 hover:border-foreground/40"
            )}
          >
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Sun className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Light Mode (Default)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Warm ivory (#FAF8F4), soft cream (#F3EEE8), and Himalayan cherry
              blossom pink accents.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
            className={cn(
              "flex flex-col items-start gap-3 border p-5 text-left transition-all",
              theme === "dark"
                ? "border-accent ring-1 ring-accent bg-surface"
                : "border-border bg-surface/40 hover:border-foreground/40"
            )}
          >
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Moon className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Dark Mode (Nocturnal)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Deep charcoal (#171615), muted rose (#B98792), and warm ivory
              typography.
            </p>
          </button>
        </div>
      </fieldset>
    </div>
  );
}

