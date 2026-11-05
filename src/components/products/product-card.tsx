"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product;
  editionIndex?: number;
  onOpenDossier?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const fallbackImage = "/images/products/sakura-mountain-mist.webp";
  const [imgSrc, setImgSrc] = React.useState(
    product.image_url || fallbackImage
  );

  React.useEffect(() => {
    setImgSrc(product.image_url || fallbackImage);
  }, [product.image_url, fallbackImage]);

  const { addItem, getEffectivePrice } = useCart();

  const isOutOfStock =
    product.status === "out_of_stock" || (typeof product.stock === "number" && product.stock <= 0);
  const isLowStock =
    product.status === "low_stock" ||
    (typeof product.stock === "number" && product.stock > 0 && product.stock <= 10);

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

  const { price, originalPrice, discountPercent, isFlashSale, discountBadge } = effective;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-lg sm:rounded-xl border border-border/70 bg-surface-elevated transition-all duration-300 hover:border-accent/50 hover:shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Product Image Stage: aspect-square on mobile to reduce height, aspect-[4/5] on larger screens */}
      <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-surface">
        <Link
          href={`/products/${product.slug}`}
          className="relative block h-full w-full"
          aria-label={`View ${product.name}`}
        >
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            unoptimized
            onError={() => setImgSrc(fallbackImage)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Minimal Tags on Image: Blurred white background for high legibility on any image */}
        <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 z-10 flex flex-wrap gap-1 pointer-events-none">
          <span className="rounded bg-white/90 backdrop-blur-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold text-zinc-900 border border-white/60 shadow-xs">
            {product.volume || "50ml"}
          </span>
          {product.is_main_male && (
            <span className="rounded bg-blue-600/95 text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium tracking-wide shadow-xs">
              Male
            </span>
          )}
          {product.is_main_female && (
            <span className="rounded bg-pink-600/95 text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium tracking-wide shadow-xs">
              Female
            </span>
          )}
        </div>

        {/* Discount Pill / Flash Sale Pill */}
        {isFlashSale ? (
          <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 z-10 pointer-events-none">
            <span className="rounded bg-gradient-to-r from-amber-500 to-rose-600 text-white px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold font-mono shadow-md animate-pulse">
              ⚡ {discountBadge}
            </span>
          </div>
        ) : discountPercent > 0 ? (
          <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 z-10 pointer-events-none">
            <span className="rounded bg-accent text-accent-foreground px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold font-mono shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        ) : null}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="rounded bg-red-600 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Clean Info Section: Tightened padding on mobile to reduce height */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5">
        <div className="space-y-0.5 sm:space-y-1">
          {/* Brand */}
          <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-accent font-semibold truncate leading-none">
            {product.brand || "SCENTS & MISTS"}
          </p>

          {/* Perfume Name */}
          <h3 className="font-serif text-xs sm:text-base font-medium text-foreground leading-snug line-clamp-1">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-accent transition-colors"
            >
              {product.name}
            </Link>
          </h3>

          {/* Rating & Stock in One Clean Minimal Line (Real Data Only) */}
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] pt-0.5">
            {product.rating_count && product.rating_count > 0 ? (
              <div className="flex items-center gap-1 text-amber-500 font-mono">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                <span className="font-semibold">{product.rating}</span>
              </div>
            ) : (
              <span className="font-mono text-muted-foreground">
                {(product.sold_count ?? 0) > 0 ? `${product.sold_count} sold` : "0 reviews"}
              </span>
            )}

            {isOutOfStock ? (
              <span className="text-rose-500 font-medium">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-amber-500 font-medium">Few Left</span>
            ) : (
              <span className="text-emerald-500 font-medium">In Stock</span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-1.5 border-t border-border/50">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "font-mono text-xs sm:text-base font-bold",
                isFlashSale ? "text-rose-500" : "text-foreground"
              )}
            >
              ₱{price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground line-through">
                ₱{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={cn(
              "w-full flex items-center justify-center gap-1 sm:gap-1.5 rounded-md sm:rounded-lg bg-primary py-1.5 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors cursor-pointer",
              isOutOfStock && "opacity-40 cursor-not-allowed hover:bg-primary"
            )}
          >
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}
