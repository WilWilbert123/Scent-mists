"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Star,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/types/product";
import { ProductGallery } from "./product-gallery";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addItem, getEffectivePrice, flashSaleCampaign } = useCart();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock =
    product.status === "out_of_stock" || (typeof product.stock === "number" && product.stock <= 0);
  const isLowStock =
    product.status === "low_stock" || (typeof product.stock === "number" && product.stock > 0 && product.stock <= 10);
  const stockCount = typeof product.stock === "number" ? product.stock : 0;

  const effective = getEffectivePrice
    ? getEffectivePrice(product)
    : {
        price: product.price || 199,
        originalPrice: product.original_price || Math.round((product.price || 199) * 1.25),
        discountPercent: 0,
        discountBadge: "",
        isFlashSale: false,
        savings: 0,
      };

  const { price, originalPrice, discountPercent, isFlashSale, discountBadge, savings } = effective;

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4 sm:space-y-12">
      <div className="grid grid-cols-1 gap-3.5 sm:gap-8 lg:gap-12 lg:grid-cols-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            name={product.name}
            primaryImage={product.image_url}
            gallery={product.gallery}
          />
        </div>

        {/* Right: Product & E-Commerce Purchase Section */}
        <div className="lg:col-span-6 space-y-3.5 sm:space-y-6">
          {/* Brand & Title */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                {product.brand || "SCENTS & MISTS"}
              </span>
            </div>

            <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-foreground leading-snug">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="font-serif text-xs sm:text-base italic text-muted-foreground">
                {product.subtitle} • {product.volume_display || "50 ml / 1.7 fl. oz."}
              </p>
            )}

            {/* Accurate Real-Time Ratings & Sold (No Mock Data) */}
            <div className="flex items-center gap-3 text-[11px] sm:text-xs font-mono pt-0.5">
              {product.rating_count && product.rating_count > 0 ? (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-muted-foreground">({product.rating_count} reviews)</span>
                </div>
              ) : (
                <span className="text-muted-foreground">0 reviews</span>
              )}
              <span className="text-border">|</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{product.sold_count ?? 0}</strong> sold
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 space-y-2 sm:space-y-3 shadow-xs">
            {isFlashSale && (
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-transparent border border-amber-500/30 px-3 py-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    ⚡ {flashSaleCampaign?.name || "Flash Sale"} Active!
                  </span>{" "}
                  <span className="text-muted-foreground">
                    Promotional {discountBadge} discount applied. You save ₱{savings.toLocaleString()}!
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-baseline gap-2.5">
              <span className={cn("font-mono text-2xl sm:text-3xl font-bold", isFlashSale ? "text-rose-500" : "text-accent")}>
                ₱{price.toLocaleString()}
              </span>
              {originalPrice > price && (
                <>
                  <span className="font-mono text-xs sm:text-base text-muted-foreground line-through">
                    ₱{originalPrice.toLocaleString()}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold font-mono",
                      isFlashSale
                        ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                        : "bg-accent/20 text-accent"
                    )}
                  >
                    {isFlashSale ? `⚡ ${discountBadge} FLASH SALE` : `-${discountPercent}% OFF`}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
              <span className="text-muted-foreground">Availability Status:</span>
              {isOutOfStock ? (
                <span className="font-bold text-rose-500 font-mono">
                  ❌ Currently Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="font-bold text-amber-500 font-mono">
                  ⚠️ Low Stock (Only {stockCount} items remaining)
                </span>
              ) : (
                <span className="font-bold text-emerald-500 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  In Stock ({stockCount} units available)
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Olfactory Scent Profile */}
          {product.scent_profile && (
            <div className="border-l-2 border-accent pl-3 py-0.5 space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider font-mono text-muted-foreground">
                Scent Aura
              </span>
              <p className="font-serif text-sm sm:text-base text-foreground italic">
                &ldquo;{product.scent_profile}&rdquo;
              </p>
            </div>
          )}

          {/* Quantity & Purchase CTAs */}
          <div className="space-y-3 sm:space-y-4 border-t border-border pt-3.5 sm:pt-5">
            <div className="flex items-center justify-between sm:justify-start sm:gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg bg-surface">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 font-mono text-xs sm:text-sm font-semibold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= stockCount || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                    className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Subtotal: <strong className="text-foreground">₱{(price * quantity).toLocaleString()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-0.5">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl border border-border bg-surface px-3 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer shadow-xs",
                  isOutOfStock && "opacity-40 cursor-not-allowed hover:border-border hover:text-foreground"
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-accent to-pink-600 px-3 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-accent/25 hover:opacity-95 transition-all cursor-pointer",
                  isOutOfStock && "opacity-40 cursor-not-allowed"
                )}
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
