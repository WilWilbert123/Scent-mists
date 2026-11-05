"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/cart-context";

interface CartDrawerProps {
  onOpenCheckout?: () => void;
}

export function CartDrawer({ onOpenCheckout }: CartDrawerProps) {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    deliverySettings,
    deliveryFee,
    isFreeDeliveryQualified,
    grandTotal,
    getEffectivePrice,
  } = useCart();

  if (!isCartOpen) return null;

  const isFreeDeliveryEnabled = Boolean(deliverySettings?.freeDeliveryPromoEnabled);
  const threshold = deliverySettings?.threshold ?? 500;
  const remainingForFreeShipping = Math.max(0, threshold - subtotal);
  const freeShippingProgress =
    threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;

  const promoMessage = (deliverySettings?.promoText || "Add ₱{amount} more for FREE Delivery").replace(
    /\{amount\}/g,
    `₱${remainingForFreeShipping.toLocaleString()}`
  );
  const successMessage =
    deliverySettings?.successText || "🎉 Congratulations! You qualify for FREE Delivery!";

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-surface-elevated text-foreground shadow-2xl border-l border-border transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <h2 className="font-serif text-lg font-medium tracking-wide">
              Shopping Cart
            </h2>
            <span className="rounded-full bg-accent/20 text-accent px-2 py-0.5 text-xs font-semibold">
              {totalItems}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Meter: ONLY RENDERED IF ENABLED IN ADMIN (HIDDEN/REMOVED BY DEFAULT) */}
        {isFreeDeliveryEnabled && (
          <div className="border-b border-border bg-surface/70 px-5 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Truck className="h-3.5 w-3.5 text-accent" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-500 font-semibold">
                    {successMessage}
                  </span>
                ) : (
                  <span>{promoMessage}</span>
                )}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="rounded-full bg-surface p-6 border border-border">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="font-serif text-lg text-foreground">
                  Your cart is empty
                </p>
                <p className="text-xs text-muted-foreground">
                  Discover our curated 50ml Aroma Body Mists and 85ml VS Perfumes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                Explore Fragrances
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              const effective = getEffectivePrice(product);
              const { price, originalPrice, isFlashSale, discountBadge } = effective;

              return (
                <div key={product.id} className="py-4 flex gap-4 items-start">
                  {/* Product Image */}
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
                            {product.brand || "SCENTS & MISTS"}
                          </span>
                          {isFlashSale && (
                            <span className="text-[9px] font-bold font-mono bg-rose-500/15 text-rose-500 border border-rose-500/30 px-1 py-0.2 rounded">
                              ⚡ {discountBadge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-foreground truncate">
                          {product.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="text-muted-foreground hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                      <span className="border border-border/80 px-1.5 py-0.5 rounded">
                        {product.volume || "50ml"}
                      </span>
                      {product.sku && (
                        <span className="text-muted-foreground/80">
                          {product.sku}
                        </span>
                      )}
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-xs font-bold ${isFlashSale ? "text-rose-500 font-mono" : "text-foreground"}`}>
                          ₱{price.toLocaleString()}
                        </span>
                        {originalPrice > price && (
                          <span className="text-[10px] text-muted-foreground line-through font-mono">
                            ₱{originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center border border-border rounded-lg bg-surface">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-foreground">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-border bg-surface p-5 space-y-3.5">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-mono text-foreground font-medium">
                  ₱{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Delivery Fee</span>
                <span className="font-mono">
                  {isFreeDeliveryQualified ? (
                    <span className="text-emerald-500 font-semibold">FREE</span>
                  ) : (
                    <span>₱{deliveryFee.toLocaleString()}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/70 pt-2 text-sm font-bold text-foreground">
                <span>Estimated Total</span>
                <span className="font-mono text-base text-accent">
                  ₱{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {onOpenCheckout ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    onOpenCheckout();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-pink-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-accent/25 hover:opacity-95 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-pink-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-accent/25 hover:opacity-95 transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}


            </div>
          </div>
        )}
      </div>
    </div>
  );
}
