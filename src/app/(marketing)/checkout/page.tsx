"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  User,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Loader2,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { LeafletDeliveryMap } from "@/components/checkout/leaflet-delivery-map";
import { createOrderAction } from "@/actions/order.actions";
import type { DeliveryLocation, PaymentMethod, Order } from "@/types/order";
import { toast } from "@/components/ui/toast";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    totalItems,
    deliveryFee,
    deliverySettings,
    isFreeDeliveryQualified,
    grandTotal,
    clearCart,
    getEffectivePrice,
  } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [notes, setNotes] = useState("");

  // Leaflet Map Pinned Location (Default Metro Manila coordinates)
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>({
    lat: 14.5995,
    lng: 120.9842,
    address_text: "Metro Manila, Philippines",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Please enter your recipient full name.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      toast.error("Please provide a valid active mobile number for courier SMS.");
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error("Please enter your complete house/unit number and street address.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add perfumes before checking out.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map((i) => {
        const eff = getEffectivePrice(i.product);
        return {
          product_id: i.product.id,
          name: i.product.name,
          brand: i.product.brand,
          volume: i.product.volume || "50ml",
          sku: i.product.sku,
          price: eff.price,
          quantity: i.quantity,
          image_url: i.product.image_url,
        };
      });

      const res = await createOrderAction({
        customer_name: customerName,
        phone,
        email: email || undefined,
        delivery_address: deliveryAddress,
        landmark: landmark || "None",
        delivery_location: deliveryLocation,
        items: orderItems,
        payment_method: paymentMethod,
        notes,
      });

      if (res.success && res.order) {
        setCompletedOrder(res.order);
        clearCart();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("scent_mists_orders_updated"));
          try {
            const bc = new BroadcastChannel("scent_mists_orders_channel");
            bc.postMessage({ type: "new_order_placed", order: res.order });
            bc.close();
          } catch {
            // ignore
          }
        }
        try {
          const storedOrdersRaw = localStorage.getItem("scent_mists_customer_orders");
          const existingList: string[] = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
          const updatedList = [
            res.order.order_number,
            ...existingList.filter((num) => num !== res.order?.order_number),
          ];
          localStorage.setItem("scent_mists_customer_orders", JSON.stringify(updatedList));

          localStorage.setItem(
            "scent_mists_last_order",
            JSON.stringify({
              id: res.order.id,
              order_number: res.order.order_number,
              created_at: res.order.created_at,
            })
          );
        } catch {
          // ignore
        }
        toast.success(`Order ${res.order.order_number} successfully placed!`);
      } else {
        toast.error(res.error || "Failed to submit order. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting order.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION MODAL / SCREEN
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 sm:p-10 shadow-2xl space-y-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
            <CheckCircle2 className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              Order Confirmed &amp; Queued
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your order <strong className="text-foreground">{completedOrder.order_number}</strong> has been received by our fulfillment hub. The admin team can now prepare and dispatch your perfumes.
            </p>
          </div>

          {/* Order Details Breakdown Box */}
          <div className="rounded-xl border border-border bg-surface p-5 text-left space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  Recipient
                </span>
                <p className="font-medium text-foreground text-sm">
                  {completedOrder.customer_name}
                </p>
                <p className="text-muted-foreground font-mono">{completedOrder.phone}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  Payment Method
                </span>
                <p className="font-medium text-foreground text-sm uppercase">
                  {completedOrder.payment_method === "cod"
                    ? "Cash on Delivery (COD)"
                    : completedOrder.payment_method.toUpperCase()}
                </p>
                <p className="text-emerald-500 font-medium">Ready upon delivery</p>
              </div>
            </div>

            <div className="space-y-1.5 pb-4 border-b border-border">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1">
                <MapPin className="h-3 w-3 text-red-500" />
                Delivery Address &amp; Leaflet Pin
              </span>
              <p className="font-medium text-foreground">{completedOrder.delivery_address}</p>
              <p className="text-muted-foreground">
                <strong>Landmark:</strong> {completedOrder.landmark}
              </p>
              <p className="text-[10px] font-mono text-accent">
                GPS Pin: {completedOrder.delivery_location.lat.toFixed(5)}, {completedOrder.delivery_location.lng.toFixed(5)}
              </p>
            </div>

            {/* Items Ordered */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Items ({completedOrder.items.length})
              </span>
              <div className="space-y-2">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-foreground">
                      {item.quantity}x {item.name} ({item.volume || "50ml"})
                    </span>
                    <span className="font-mono text-foreground font-medium">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-bold text-foreground">
              <span>Total Amount</span>
              <span className="text-base text-accent font-mono">
                ₱{completedOrder.total_amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={`/orders/${completedOrder.order_number}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-xs uppercase tracking-widest text-accent-foreground hover:opacity-90 transition-opacity font-bold shadow-lg"
            >
              <Truck className="h-4 w-4" />
              <span>Track Order Live (Shopee / Lazada View)</span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3.5 text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors font-medium"
            >
              Back to Fragrances
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART CHECK
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface border border-border">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-foreground">Your Cart is Empty</h1>
          <p className="text-sm text-muted-foreground">
            Please select perfumes from our 50ml Aroma Body Mist or 85ml VS Perfume catalogue to continue with checkout.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-xs uppercase tracking-widest text-primary-foreground hover:bg-accent transition-colors font-medium"
        >
          Browse Fragrance Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Link */}
      <div className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Customer & Delivery Info with Leaflet Map */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
              Express Delivery Checkout
            </h1>
            <p className="text-xs text-muted-foreground">
              Complete your contact details and pin your exact delivery location on the interactive Leaflet map.
            </p>
          </div>

          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            {/* 1. Contact Info */}
            <div className="rounded-xl border border-border bg-surface-elevated p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/70 pb-3">
                <User className="h-4 w-4 text-accent" />
                <span>1. Customer &amp; Recipient Contact</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0917 123 4567"
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-medium text-foreground flex items-center justify-between">
                    <span>Email Address (Optional)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      For receipt &amp; dispatch updates
                    </span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* 2. Interactive Leaflet Delivery Map & Address */}
            <div className="rounded-xl border border-border bg-surface-elevated p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>2. Delivery Drop-Off Pin (Leaflet Map)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Exact GPS Pinpoint
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Move the pin directly to your gate, building lobby, or house doorstep so the courier rider navigates straight to you.
              </p>

              {/* Interactive Leaflet Map Component */}
              <LeafletDeliveryMap
                location={deliveryLocation}
                onChange={(newLoc) => {
                  setDeliveryLocation(newLoc);
                  if (newLoc.address_text && !deliveryAddress) {
                    setDeliveryAddress(newLoc.address_text);
                  }
                }}
              />

              <div className="space-y-3 pt-2 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">
                    Complete House / Unit No. &amp; Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Unit 402 Tower B, Greenfield Residences, Barangay San Antonio, Pasig City"
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground flex items-center justify-between">
                    <span>Nearest Landmark / Courier Notes</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Shopee / Grab / Lazada style rider guide
                    </span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Beside 7-Eleven, Yellow Gate with white dog, leave at guard lobby"
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="rounded-xl border border-border bg-surface-elevated p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/70 pb-3">
                <CreditCard className="h-4 w-4 text-accent" />
                <span>3. Payment Method</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* COD */}
                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border bg-surface hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-foreground">Cash on Delivery</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-accent"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pay securely in cash when rider arrives at your pin.
                  </p>
                </label>

                {/* GCash */}
                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "gcash"
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border bg-surface hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-foreground">GCash / E-Wallet</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gcash"
                      checked={paymentMethod === "gcash"}
                      onChange={() => setPaymentMethod("gcash")}
                      className="accent-accent"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Direct e-wallet QR or courier QR payment upon delivery.
                  </p>
                </label>

                {/* Bank Transfer */}
                <label
                  className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border bg-surface hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-foreground">Bank Transfer</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={() => setPaymentMethod("bank_transfer")}
                      className="accent-accent"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    BDO, BPI, or UnionBank online transfer.
                  </p>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="rounded-xl border border-border bg-surface-elevated p-6 space-y-2 text-xs">
              <label className="font-medium text-foreground">
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please ring doorbell twice, leave with concierge if unavailable."
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary Box */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-lg font-medium text-foreground">
                Order Summary
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {totalItems} items
              </span>
            </div>

            {/* Item list */}
            <div className="max-h-72 overflow-y-auto space-y-3 divide-y divide-border/60 pr-1">
              {items.map(({ product, quantity }) => {
                const eff = getEffectivePrice(product);
                return (
                  <div key={product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[10px] font-mono uppercase text-accent font-semibold truncate">
                          {product.brand}
                        </p>
                        {eff.isFlashSale && (
                          <span className="text-[9px] font-bold font-mono bg-rose-500/15 text-rose-500 border border-rose-500/30 px-1 py-0.2 rounded">
                            ⚡ {eff.discountBadge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-medium text-foreground truncate">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {quantity} x ₱{eff.price.toLocaleString()} • {product.volume || "50ml"}
                        {eff.originalPrice > eff.price && (
                          <span className="line-through ml-1 text-muted-foreground/70">
                            ₱{eff.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>

                    <span className={`font-mono text-xs font-semibold ${eff.isFlashSale ? "text-rose-500" : "text-foreground"}`}>
                      ₱{(eff.price * quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground font-medium">
                  ₱{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span>Courier Delivery Fee</span>
                  {isFreeDeliveryQualified && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.2 rounded font-semibold">
                      FREE (₱{(deliverySettings?.threshold ?? 500).toLocaleString()}+)
                    </span>
                  )}
                </span>
                <span className="font-mono">
                  {isFreeDeliveryQualified ? (
                    <span className="text-emerald-500 font-bold">FREE</span>
                  ) : (
                    <span>₱{deliveryFee.toLocaleString()}</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-border/80 pt-3 text-base font-bold text-foreground">
                <span>Total Amount</span>
                <span className="font-mono text-xl text-accent">
                  ₱{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-pink-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-accent/25 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm &amp; Place Order (₱{grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <div className="rounded-lg bg-surface p-3 border border-border text-[11px] text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Guaranteed Safe Transaction</span>
                </p>
                <p>
                  No upfront credit card required. Inspect your order and verify the perfume bottle before paying with Cash on Delivery or GCash.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
