"use client";

import React, { useState, useMemo } from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

const PRIORITY_SLUG_ORDER = [
  // Top Male Picks
  "aroma-body-mist-50ml-clinique-happy",
  "aroma-body-mist-50ml-bvlgari-man-in-black",
  "aroma-body-mist-50ml-ck-eternity",
  "vs-perfume-85ml-secret-angel-gold",
  // Top Female Picks
  "aroma-body-mist-50ml-vs-sweet-temptation",
  "aroma-body-mist-50ml-ariana-grande-sweet-like-candy",
  "aroma-body-mist-50ml-katy-perry-purr",
  "aroma-body-mist-50ml-vs-love-spell",
  "aroma-body-mist-50ml-paris-hilton-heiress",
  "vs-perfume-85ml-winter-bombshell",
  "aroma-body-mist-50ml-bbw-sweet-pea",
  "aroma-body-mist-50ml-vs-bombshell",
  "vs-perfume-85ml-pink-ravishing-love",
];

export function ProductGrid({ products }: ProductGridProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  const TABS = [
    { id: "all", label: "All", count: products.length },
    {
      id: "male_main",
      label: "Male Picks",
      count: products.filter((p) => p.is_main_male || p.gender === "male").length,
    },
    {
      id: "female_main",
      label: "Female Picks",
      count: products.filter((p) => p.is_main_female || p.gender === "female").length,
    },
    {
      id: "mist_50ml",
      label: "50ml Mists",
      count: products.filter((p) => p.volume === "50ml").length,
    },
    {
      id: "vs_85ml",
      label: "85ml Perfumes",
      count: products.filter((p) => p.volume === "85ml").length,
    },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeTab === "male_main") {
      list = list.filter((p) => p.is_main_male || p.gender === "male");
    } else if (activeTab === "female_main") {
      list = list.filter((p) => p.is_main_female || p.gender === "female");
    } else if (activeTab === "mist_50ml") {
      list = list.filter((p) => p.volume === "50ml");
    } else if (activeTab === "vs_85ml") {
      list = list.filter((p) => p.volume === "85ml");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.price || 199) - (b.price || 199));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.price || 199) - (a.price || 199));
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
    } else {
      // Default: Priority showcase first (Clinique Happy, Bvlgari, Eternity, Secret Angel Gold, Sweet Temptation, Ariana Grande, etc.)
      list.sort((a, b) => {
        const aIndex = PRIORITY_SLUG_ORDER.indexOf(a.slug);
        const bIndex = PRIORITY_SLUG_ORDER.indexOf(b.slug);
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        const aFeatured = a.is_main_male || a.is_main_female || a.is_featured ? 1 : 0;
        const bFeatured = b.is_main_male || b.is_main_female || b.is_featured ? 1 : 0;
        return bFeatured - aFeatured;
      });
    }

    return list;
  }, [products, activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Category Tabs & Controls */}
      <div className="space-y-4">
        {/* Category Pills (Touch scroll on mobile with hidden scrollbar) */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-surface border border-border/80 text-muted-foreground hover:text-foreground hover:border-accent/40"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-mono",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Bar */}
        <div className="flex gap-2.5 sm:gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search perfumes by name, brand, or notes..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-2xs"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm bg-surface border border-border/80 rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-medium cursor-pointer shrink-0 shadow-2xs"
          >
            <option value="featured">Featured</option>
            <option value="popular">Best Selling</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Responsive Grid: 2 columns on mobile, 3 columns on desktop for spacious luxury framing */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center space-y-2">
          <Package className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="font-serif text-base text-foreground">No perfumes found</h3>
          <p className="text-xs text-muted-foreground">
            Try checking your spelling or clearing search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-3 xl:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
