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
  const { addItem } = useCart();
  const fallbackImage = "/images/products/sakura-mountain-mist.webp";
  const [imgSrc, setImgSrc] = React.useState(
    product.image_url || fallbackImage
  );

  React.useEffect(() => {
    setImgSrc(product.image_url || fallbackImage);
  }, [product.image_url, fallbackImage]);

  const isOutOfStock =
    product.status === "out_of_stock" || (typeof product.stock === "number" && product.stock <= 0);
  const isLowStock =
    product.status === "low_stock" ||
    (typeof product.stock === "number" && product.stock > 0 && product.stock <= 10);

  const price = product.price || 199;
  const originalPrice = product.original_price || Math.round(price * 1.25);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/70 bg-surface-elevated transition-all duration-300 hover:border-accent/50 hover:shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
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

        {/* Minimal Tags on Image */}
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1 pointer-events-none">
          <span className="rounded bg-background/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-mono font-medium text-foreground border border-border/60">
            {product.volume || "50ml"}
          </span>
          {product.is_main_male && (
            <span className="rounded bg-blue-600/90 text-white px-1.5 py-0.5 text-[9px] font-medium tracking-wide">
              Male
            </span>
          )}
          {product.is_main_female && (
            <span className="rounded bg-pink-600/90 text-white px-1.5 py-0.5 text-[9px] font-medium tracking-wide">
              Female
            </span>
          )}
        </div>

        {/* Discount Pill */}
        {discountPercent > 0 && (
          <div className="absolute right-2 top-2 z-10 pointer-events-none">
            <span className="rounded bg-accent text-accent-foreground px-1.5 py-0.5 text-[9px] font-bold font-mono shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="rounded bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Clean Info Section (No clunky accords or long quotes) */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 space-y-2.5">
        <div className="space-y-1">
          {/* Brand */}
          <p className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold truncate">
            {product.brand || "SCENTS & MISTS"}
          </p>

          {/* Perfume Name */}
          <h3 className="font-serif text-sm sm:text-base font-medium text-foreground leading-snug line-clamp-1">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-accent transition-colors"
            >
              {product.name}
            </Link>
          </h3>

          {/* Rating & Stock in One Clean Minimal Line (Real Data Only) */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-0.5">
            {product.rating_count && product.rating_count > 0 ? (
              <div className="flex items-center gap-1 text-amber-500 font-mono">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-semibold">{product.rating}</span>
              </div>
            ) : (
              <span className="text-[10px] font-mono text-muted-foreground">
                {(product.sold_count ?? 0) > 0 ? `${product.sold_count} sold` : "0 reviews"}
              </span>
            )}

            {isOutOfStock ? (
              <span className="text-[10px] text-rose-500 font-medium">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-[10px] text-amber-500 font-medium">Few Left</span>
            ) : (
              <span className="text-[10px] text-emerald-500 font-medium">In Stock</span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm sm:text-base font-bold text-foreground">
              ₱{price.toLocaleString()}
            </span>
            {originalPrice > price && (
              <span className="font-mono text-[10px] text-muted-foreground line-through">
                ₱{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 px-3 text-[11px] font-medium uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors cursor-pointer",
              isOutOfStock && "opacity-40 cursor-not-allowed hover:bg-primary"
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}
