"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={cn(
        "inline-flex min-h-[42px] min-w-[42px] items-center justify-center border border-border/80 bg-transparent p-2.5 text-foreground transition-colors hover:border-accent hover:bg-surface",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-blossom" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" aria-hidden="true" />
      )}
      <span className="visually-hidden">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
}

