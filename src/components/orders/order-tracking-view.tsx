"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  MapPin,
  Phone,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Clock,
  ArrowLeft,
  Navigation,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";
import { getOrderByIdAction } from "@/actions/order.actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface OrderTrackingViewProps {
  initialOrder: Order;
}

const STEPS = [
  {
    key: "pending" as OrderStatus,
    label: "Order Placed",
    sublabel: "Order confirmed & queued",
    icon: ShoppingBag,
    desc: "Your order details have been received by the atelier and queued for confirmation.",
  },
  {
    key: "confirmed" as OrderStatus,
    label: "Order Confirmed",
    sublabel: "Verified by atelier",
    icon: CheckCircle2,
    desc: "Order has been approved and scheduled for batch fulfillment and bottling.",
  },
  {
    key: "preparing" as OrderStatus,
    label: "Processing & Packed",
    sublabel: "In protective luxury box",
    icon: Package,
    desc: "Your flacons have been inspected, secured in protective packaging, and prepared for dispatch.",
  },
  {
    key: "out_for_delivery" as OrderStatus,
    label: "Out for Delivery",
    sublabel: "Courier rider is on the way",
    icon: Truck,
    desc: "Your parcel is with our courier partner and en route to your pinned drop-off address.",
  },
  {
    key: "delivered" as OrderStatus,
    label: "Delivered",
    sublabel: "Received by customer",
    icon: CheckCheck,
    desc: "Parcel has been successfully delivered and received. Thank you for choosing SCENTS & MISTS!",
  },
];

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderTrackingView({ initialOrder }: OrderTrackingViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Leaflet Map Reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInitializedRef = useRef(false);

  // Poll for status updates in real time (every 4 seconds)
  const pollStatus = useCallback(async (silent = true) => {
    if (!silent) setIsRefreshing(true);
    try {
      const updated = await getOrderByIdAction(order.order_number);
      if (updated) {
        if (updated.status !== order.status) {
          toast.success(
            `Status updated: ${updated.status === "out_for_delivery" ? "Out for Delivery! Rider is on the way." : updated.status.toUpperCase()}`
          );
        }
        setOrder(updated);
      }
      setLastChecked(new Date());
      if (!silent) {
        toast.success("Order status refreshed.");
      }
    } catch {
      if (!silent) toast.error("Could not refresh order status.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [order.order_number, order.status]);

  useEffect(() => {
    const timer = setInterval(() => {
      pollStatus(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [pollStatus]);

  // Initialize Leaflet Map for the delivery pin
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapInitializedRef.current) {
      return;
    }

    let isCancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (isCancelled || !mapContainerRef.current) return;

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const lat = order.delivery_location?.lat || 14.5995;
      const lng = order.delivery_location?.lng || 120.9842;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Marker
      const customIcon = L.divIcon({
        className: "custom-delivery-pin",
        html: `
          <div style="background-color: #D4AF37; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2px solid #ffffff;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker
        .bindPopup(
          `<strong>${order.customer_name}</strong><br/>${order.delivery_address}`
        )
        .openPopup();

      mapInitializedRef.current = true;
    }

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [order.delivery_location?.lat, order.delivery_location?.lng, order.customer_name, order.delivery_address]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopiedCode(true);
    toast.success("Order number copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Tracking link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentStepIndex = STATUS_PRIORITY[order.status] ?? 0;
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Storefront</span>
        </Link>

        {/* Live sync heartbeat pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[11px] text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Tracking Active ({lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})</span>
          <button
            type="button"
            onClick={() => pollStatus(false)}
            disabled={isRefreshing}
            className="p-1 hover:text-foreground cursor-pointer transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Order Header Card (Shopee/Lazada Style) */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                Order Tracking
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-accent hover:underline cursor-pointer"
                title="Copy order number"
              >
                <span>{order.order_number}</span>
                {copiedCode ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-bold">
              {order.customer_name}&apos;s Fragrance Order
            </h1>
            <p className="text-xs text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          {/* Shopee / Lazada Large Status Pill */}
          <div className="shrink-0">
            {isCancelled ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-semibold text-xs tracking-wide">
                <XCircle className="h-4 w-4" />
                <span>Order Cancelled</span>
              </span>
            ) : order.status === "out_for_delivery" ? (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-600 dark:text-orange-400 shadow-sm animate-pulse">
                <Truck className="h-5 w-5 shrink-0" />
                <div className="text-left">
                  <span className="block font-bold text-xs uppercase tracking-wide">
                    Out for Delivery
                  </span>
                  <span className="block text-[10px] text-orange-500/90 font-medium">
                    Courier is en route to your pin
                  </span>
                </div>
              </div>
            ) : order.status === "delivered" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold text-xs uppercase tracking-wide">
                <CheckCheck className="h-4 w-4" />
                <span>Delivered Successfully</span>
              </span>
            ) : order.status === "preparing" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-500 font-bold text-xs uppercase tracking-wide">
                <Package className="h-4 w-4" />
                <span>Packing Fragrances</span>
              </span>
            ) : order.status === "confirmed" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-500 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="h-4 w-4" />
                <span>Order Confirmed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold text-xs uppercase tracking-wide">
                <Clock className="h-4 w-4" />
                <span>Pending Review</span>
              </span>
            )}
          </div>
        </div>

        {/* Shopee / Lazada Interactive Step-by-Step Delivery Tracker */}
        {!isCancelled && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-[0.16em] text-foreground font-semibold">
                Delivery Progress Workflow
              </h2>
              <span className="text-[11px] text-muted-foreground font-mono">
                Step {currentStepIndex + 1} of 5
              </span>
            </div>

            {/* Desktop / Tablet Horizontal Timeline */}
            <div className="hidden sm:grid grid-cols-5 relative gap-2">
              {/* Connecting progress background line */}
              <div className="absolute top-5 left-10 right-10 h-1 bg-border -z-0" />
              {/* Active filled connecting line */}
              <div
                className="absolute top-5 left-10 h-1 bg-accent transition-all duration-700 ease-out -z-0"
                style={{
                  width: `${(currentStepIndex / (STEPS.length - 1)) * 80}%`,
                }}
              />

              {STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFuture = idx > currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative z-10">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                        isPassed && "bg-accent border-accent text-accent-foreground shadow",
                        isCurrent && "bg-surface-elevated border-accent text-accent ring-4 ring-accent/20 scale-110 shadow-lg",
                        isFuture && "bg-surface border-border text-muted-foreground/60"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="space-y-0.5 max-w-[120px]">
                      <span
                        className={cn(
                          "block text-xs font-semibold leading-tight",
                          isCurrent && "text-accent",
                          isPassed && "text-foreground",
                          isFuture && "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="block text-[10px] text-muted-foreground leading-tight">
                        {step.sublabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="sm:hidden space-y-4 relative pl-2">
              <div className="absolute top-4 bottom-4 left-5 w-0.5 bg-border -z-0" />
              {STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFuture = idx > currentStepIndex;

                return (
                  <div key={step.key} className="flex items-start gap-3.5 relative z-10">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isPassed && "bg-accent border-accent text-accent-foreground shadow-xs",
                        isCurrent && "bg-surface-elevated border-accent text-accent ring-3 ring-accent/20 scale-110 shadow",
                        isFuture && "bg-surface border-border text-muted-foreground/60"
                      )}
                    >
                      <IconComponent className="h-3 w-3" />
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-bold leading-none",
                            isCurrent && "text-accent",
                            isPassed && "text-foreground",
                            isFuture && "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-mono text-accent font-bold uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Stage Highlight Box */}
            <div className="p-4 rounded-xl border border-accent/30 bg-accent/5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-accent">
                Current Status Update
              </span>
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {STEPS[currentStepIndex]?.desc || "Processing order."}
              </p>
              {order.status === "out_for_delivery" && (
                <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold pt-1">
                  ⚡ Courier Rider Reminder: Please prepare exact cash ₱{order.total_amount.toLocaleString()} for Cash on Delivery.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Delivery Destination & Leaflet Map Pin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipient & Location Info */}
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Delivery Destination</span>
            </h3>
            <span className="text-[10px] font-mono uppercase text-muted-foreground">
              GPS Location Pin
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Recipient
              </span>
              <p className="font-bold text-foreground text-sm">{order.customer_name}</p>
              <p className="text-muted-foreground font-mono flex items-center gap-1.5 pt-0.5">
                <Phone className="h-3 w-3 text-accent" />
                <span>{order.phone}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Drop-Off Address
              </span>
              <p className="text-foreground font-medium leading-relaxed">
                {order.delivery_address}
              </p>
              {order.landmark && (
                <p className="text-muted-foreground pt-1">
                  <strong>Landmark:</strong> {order.landmark}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Payment Option
              </span>
              <p className="text-foreground font-bold uppercase">
                {order.payment_method === "cod"
                  ? "Cash on Delivery (COD)"
                  : order.payment_method.toUpperCase()}
              </p>
              <p className="text-emerald-500 font-medium text-[11px]">
                Pay upon courier arrival
              </p>
            </div>

            {order.notes && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Special Instructions
                </span>
                <p className="text-muted-foreground italic">&ldquo;{order.notes}&rdquo;</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaflet GPS Map Container */}
        <div className="rounded-2xl border border-border bg-surface-elevated overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border bg-surface flex items-center justify-between text-xs">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-accent" />
              <span>Delivery Pin Map</span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {order.delivery_location.lat.toFixed(4)}, {order.delivery_location.lng.toFixed(4)}
            </span>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full h-56 sm:h-full min-h-[220px] bg-surface"
          />
        </div>
      </div>

      {/* Package Contents Breakdown */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-accent" />
            <span>Fragrance Package Items ({order.items.length})</span>
          </h3>
          <span className="text-xs font-mono font-bold text-accent">
            Total: ₱{order.total_amount.toLocaleString()}
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-10 shrink-0 rounded overflow-hidden border border-border bg-surface">
                  <Image
                    src={item.image_url || "/images/products/sakura-mountain-mist.webp"}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/images/products/sakura-mountain-mist.webp";
                    }}
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="font-bold text-foreground truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {item.volume || "50ml"} • {item.brand || "SCENTS & MISTS"}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="block font-mono font-bold text-foreground">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono">
                  {item.quantity}x @ ₱{item.price.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="border-t border-border pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">₱{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="font-mono">
              {order.delivery_fee === 0 ? (
                <span className="text-emerald-500 font-semibold">FREE</span>
              ) : (
                `₱${order.delivery_fee}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-foreground font-bold text-sm pt-2 border-t border-border">
            <span>Total Payable ({order.payment_method.toUpperCase()})</span>
            <span className="font-mono text-accent text-base">
              ₱{order.total_amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Share & Help Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface text-xs">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          {copiedLink ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4 text-accent" />
          )}
          <span>{copiedLink ? "Tracking Link Copied!" : "Copy Live Tracking Link to Share"}</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-accent hover:underline font-medium"
          >
            <span>Need Help with Delivery? Contact Atelier</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
