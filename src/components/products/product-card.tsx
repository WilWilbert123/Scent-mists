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
  priority?: boolean;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
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
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "280px",
      }}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border/80 bg-surface-elevated transition-colors duration-200 sm:transition-all sm:duration-300 hover:border-accent/60 hover:shadow-luxury overflow-hidden",
        className
      )}
    >
      {/* Product Image Stage: Clean aspect-square on mobile, 4/5 portrait ratio on desktop for majestic presentation */}
      <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F1ECE4] dark:from-[#1D1B19] dark:to-[#161413]">
        <Link
          href={`/products/${product.slug}`}
          className="relative block h-full w-full cursor-pointer"
          aria-label={`View ${product.name}`}
        >
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onError={() => setImgSrc(fallbackImage)}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 300px"
            className="object-cover object-center sm:transition-transform sm:duration-700 sm:ease-out sm:group-hover:scale-105"
          />
        </Link>

        {/* Crisp tags on image without GPU backdrop blur shaders */}
        <div className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="rounded-md bg-black/75 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-medium text-white border border-white/10 shadow-xs">
            {product.volume || "50ml"}
          </span>
          {product.is_main_male && (
            <span className="rounded-md bg-slate-900/90 text-slate-100 border border-slate-700/50 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-medium tracking-wide shadow-xs">
              Male
            </span>
          )}
          {product.is_main_female && (
            <span className="rounded-md bg-rose-950/85 text-rose-200 border border-rose-500/20 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-medium tracking-wide shadow-xs">
              Female
            </span>
          )}
        </div>

        {/* Sleek Discount Badge — Positioned at bottom right corner of the product image */}
        {isFlashSale ? (
          <div className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 z-10 pointer-events-none">
            <span className="rounded-md bg-gradient-to-r from-amber-500 to-rose-600 text-white px-2 py-0.5 text-[9px] sm:text-[10px] font-bold font-mono shadow-md animate-pulse">
              ⚡ {discountBadge}
            </span>
          </div>
        ) : discountPercent > 0 ? (
          <div className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 z-10 pointer-events-none">
            <span className="rounded-md bg-accent text-accent-foreground px-2 py-0.5 text-[9px] sm:text-[10px] font-bold font-mono shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        ) : null}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <span className="rounded-md bg-red-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Spacious, Clean Info Section */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-5 lg:p-6 space-y-2.5 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          {/* Brand */}
          <p className="text-[9px] sm:text-xs font-mono uppercase tracking-[0.2em] text-accent font-semibold truncate leading-none">
            {product.brand || "SCENTS & MISTS"}
          </p>

          {/* Perfume Name */}
          <h3 className="font-serif text-xs sm:text-lg lg:text-xl font-normal text-foreground group-hover:text-accent transition-colors line-clamp-1 leading-snug">
            <Link
              href={`/products/${product.slug}`}
              className="cursor-pointer"
            >
              {product.name}
            </Link>
          </h3>

          {/* Live Status & Volume/Rating Line */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs pt-0.5">
            {product.rating_count && product.rating_count > 0 ? (
              <div className="flex items-center gap-1 sm:gap-1.5 text-amber-500 font-mono">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                <span className="font-semibold text-xs sm:text-sm">{product.rating}</span>
                <span className="text-muted-foreground/70 text-[10px] sm:text-[11px]">({product.rating_count})</span>
              </div>
            ) : (
              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground/80">
                {(product.sold_count ?? 0) > 0 ? `${product.sold_count} sold` : "0 sold"}
              </span>
            )}

            {isOutOfStock ? (
              <span className="text-rose-500 font-medium">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-amber-500 font-medium">Few Left</span>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4 border-t border-border/60">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-mono text-sm sm:text-2xl font-bold tracking-tight",
                isFlashSale ? "text-rose-500" : "text-foreground"
              )}
            >
              ₱{price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <span className="font-mono text-[10px] sm:text-sm text-muted-foreground line-through">
                ₱{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-foreground text-background py-2 sm:py-3.5 px-2.5 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-accent hover:text-white transition-all cursor-pointer shadow-xs active:scale-[0.98] whitespace-nowrap",
              isOutOfStock && "opacity-40 cursor-not-allowed hover:bg-foreground hover:text-background active:scale-100"
            )}
          >
            <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
});
