"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/data/admin-navigation";

export function AdminSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const matches = query.trim()
    ? ADMIN_NAV_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative hidden md:block w-64">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder="Quick jump admin..."
          aria-label="Quick jump to admin section"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="h-9 w-full border border-border bg-surface pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-accent"
        />
      </div>

      {focused && matches.length > 0 && (
        <ul
          role="listbox"
          aria-label="Matching admin routes"
          className="absolute left-0 right-0 top-10 z-50 border border-border bg-surface-elevated p-1 shadow-lg"
        >
          {matches.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                onMouseDown={() => {
                  router.push(item.href);
                  setQuery("");
                }}
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-surface"
              >
                <span className="text-xs font-medium text-foreground">
                  {item.label}
                </span>
                <span className="text-[11px] text-muted-foreground line-clamp-1">
                  {item.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

