"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Star,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";
import type { Product } from "@/types/product";
import { ProductGallery } from "./product-gallery";
import { FragranceNotesDisplay } from "./fragrance-notes-display";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock =
    product.status === "out_of_stock" || (typeof product.stock === "number" && product.stock <= 0);
  const isLowStock =
    product.status === "low_stock" || (typeof product.stock === "number" && product.stock > 0 && product.stock <= 10);
  const stockCount = typeof product.stock === "number" ? product.stock : 0;

  const price = product.price || 199;
  const originalPrice = product.original_price || Math.round(price * 1.25);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            name={product.name}
            primaryImage={product.image_url}
            gallery={product.gallery}
          />
        </div>

        {/* Right: Product & E-Commerce Purchase Section */}
        <div className="lg:col-span-6 space-y-7">
          {/* Brand Badge */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded">
                {product.brand || "SCENTS & MISTS"}
              </span>
            </div>

            <h1 className="heading-section text-foreground pt-1">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="font-serif text-lg italic text-muted-foreground">
                {product.subtitle} • {product.volume_display || "50 ml / 1.7 fl. oz."}
              </p>
            )}

            {/* Accurate Real-Time Ratings & Sold (No Mock Data) */}
            <div className="flex items-center gap-4 text-xs font-mono pt-1">
              {product.rating_count && product.rating_count > 0 ? (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
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
          <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold text-accent">
                ₱{price.toLocaleString()}
              </span>
              {originalPrice > price && (
                <>
                  <span className="font-mono text-base text-muted-foreground line-through">
                    ₱{originalPrice.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold font-mono text-accent">
                    -{discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
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
          <p className="body-editorial text-foreground/90 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Olfactory Scent Profile */}
          {product.scent_profile && (
            <div className="border-l-2 border-accent pl-4 py-1 space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                Scent Aura
              </span>
              <p className="font-serif text-base text-foreground italic">
                &ldquo;{product.scent_profile}&rdquo;
              </p>
            </div>
          )}

          {/* Quantity & Purchase CTAs */}
          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl bg-surface">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-4 font-mono text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= stockCount || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                  className="p-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Subtotal: ₱{(price * quantity).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer",
                  isOutOfStock && "opacity-40 cursor-not-allowed hover:border-border hover:text-foreground"
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-pink-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-accent/25 hover:opacity-95 transition-all cursor-pointer",
                  isOutOfStock && "opacity-40 cursor-not-allowed"
                )}
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fragrance Notes Accord Section */}
      <FragranceNotesDisplay
        topNotes={product.top_notes}
        heartNotes={product.heart_notes}
        baseNotes={product.base_notes}
      />
    </div>
  );
}
